'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

// Define the shape of the profile data
export interface UserProfile {
  id: string;
  username?: string;
  // fullName field removed from DB
  age: number;
  sex: string;
  weight_kg: number;
  height_cm: number;
  activity_level: string;
  meals_per_day: number;
  diet_pattern: string;
  weight_goal_kg?: number;
  created_at: string;
  updated_at: string;
}

interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data as UserProfile;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const newProfile = await fetchProfile(session.user.id);
      setProfile(newProfile);
    }
  }, [supabase, fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    async function initUser() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (mounted) {
        setUser(session?.user ?? null);
        if (session?.user) {
          const p = await fetchProfile(session.user.id);
          if (mounted) setProfile(p);
        }
        setIsLoading(false);
      }
    }

    initUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        if (session?.user) {
          // Only fetch if we don't have it or if it might have changed (e.g. on sign in)
          // For simplicity we fetch on every auth change that yields a user
          const p = await fetchProfile(session.user.id);
          if (mounted) setProfile(p);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  return (
    <UserContext.Provider value={{ user, profile, isLoading, refreshProfile, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
