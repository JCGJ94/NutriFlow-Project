'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from './UserContext';
import { DayOfWeek } from '@nutriflow/shared';
// Define PlanSummary locally to avoid circular deps or complex imports. 
// Ideally should be in a shared types file.
interface PlanSummary {
  id: string;
  weekStart: string;
  targetKcal: number;
  status: string;
  createdAt: string;
}

// --- Type Definitions (Replicated from page.tsx for Context usage) ---
interface MealItem {
    id: string;
    ingredientId: string;
    ingredientName: string;
    grams: number;
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface Meal {
    id: string;
    dayOfWeek: DayOfWeek;
    mealType: string;
    isLocked: boolean;
    totalKcal: number;
    items: MealItem[];
}

interface Day {
    dayOfWeek: DayOfWeek;
    meals: Meal[];
    totalKcal: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
}

interface Plan {
    id: string;
    weekStart: string;
    targetKcal: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
    status: string;
    days: Day[];
}

interface ExerciseSet {
    exerciseName: string;
    sets: number;
    reps?: number;
    durationSec?: number;
    restSec: number;
}

interface WorkoutDay {
    dayOfWeek: number;
    name: string;
    type: string;
    isRestDay: boolean;
    exercises: ExerciseSet[];
    totalDurationMin: number;
    caloriesBurned: number;
}

interface ExercisePlan {
    weekStart: string;
    goal: string;
    daysPerWeek: number;
    workoutDays: WorkoutDay[];
}
// ------------------------------------------------------------------

interface ShoppingListItem {
  id: string;
  ingredientId: string | null;
  ingredientName: string;
  category: string; // Simplified for context
  totalGrams?: number;
  isChecked: boolean;
  isCustom: boolean;
}

interface ShoppingList {
  planId: string;
  weekStart: string;
  items: ShoppingListItem[];
  generatedAt: string;
}

interface PlansContextType {
  plans: PlanSummary[];
  isLoadingPlans: boolean;
  refreshPlans: () => Promise<void>;
  
  // Shopping List Caching
  cachedShoppingLists: Record<string, ShoppingList>;
  getShoppingList: (planId: string) => Promise<ShoppingList | null>;
  updateShoppingListCache: (planId: string, list: ShoppingList) => void;

  // Full Plan Details Caching
  cachedPlanDetails: Record<string, Plan>;
  cachedExercisePlans: Record<string, ExercisePlan>;
  getPlanDetails: (planId: string) => Promise<Plan | null>;
  getExercisePlan: (planId: string) => Promise<ExercisePlan | null>;
  updatePlanCache: (plan: Plan) => void;
  updateExercisePlanCache: (planId: string, plan: ExercisePlan) => void;
}

const PlansContext = createContext<PlansContextType | undefined>(undefined);

export function PlansProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  
  // Caches
  const [cachedShoppingLists, setCachedShoppingLists] = useState<Record<string, ShoppingList>>({});
  const [cachedPlanDetails, setCachedPlanDetails] = useState<Record<string, Plan>>({});
  const [cachedExercisePlans, setCachedExercisePlans] = useState<Record<string, ExercisePlan>>({});
  
  // Refs for stable callback access to avoid infinite loops
  const cachedPlanDetailsRef = useRef(cachedPlanDetails);
  const cachedExercisePlansRef = useRef(cachedExercisePlans);
  
  // Sync refs with state
  useEffect(() => { cachedPlanDetailsRef.current = cachedPlanDetails; }, [cachedPlanDetails]);
  useEffect(() => { cachedExercisePlansRef.current = cachedExercisePlans; }, [cachedExercisePlans]);

  const supabase = createClient();

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Plans Cache
      const cachedPlans = localStorage.getItem('nutriflow_plans_cache');
      if (cachedPlans) {
        try {
          const parsed = JSON.parse(cachedPlans);
          setPlans(parsed);
          setIsLoadingPlans(false);
        } catch (e) {
          console.error('Error parsing plans cache', e);
        }
      }
      
      // Shopping Lists Cache
      const cachedLists = localStorage.getItem('nutriflow_shopping_lists_cache');
      if (cachedLists) {
         try { setCachedShoppingLists(JSON.parse(cachedLists)); } catch(e) {}
      }

      // Plans Details Cache
      const cachedDetails = localStorage.getItem('nutriflow_plan_details_cache');
      if (cachedDetails) {
         try { setCachedPlanDetails(JSON.parse(cachedDetails)); } catch(e) {}
      }

      // Exercise Plans Cache
      const cachedExercises = localStorage.getItem('nutriflow_exercise_plans_cache');
      if (cachedExercises) {
         try { setCachedExercisePlans(JSON.parse(cachedExercises)); } catch(e) {}
      }
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    if (!user) return;
    if (plans.length === 0) setIsLoadingPlans(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const res = await fetch('/api/plans', {
         headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setPlans(data);
        localStorage.setItem('nutriflow_plans_cache', JSON.stringify(data));
      }
    } catch (error) {
       console.error('Error fetching plans', error);
    } finally {
      setIsLoadingPlans(false);
    }
  }, [user, supabase, plans.length]);

  const getShoppingList = useCallback(async (planId: string): Promise<ShoppingList | null> => {
      // Return cached version immediately if available
      if (cachedShoppingLists[planId]) {
          fetchShoppingListBackground(planId);
          return cachedShoppingLists[planId];
      }
      return await fetchShoppingListBackground(planId);
  }, [cachedShoppingLists, user, supabase]);

  const fetchShoppingListBackground = async (planId: string): Promise<ShoppingList | null> => {
      if (!user) return null;
      try {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          if (!token) return null;

          const res = await fetch(`/api/shopping-list/${planId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (res.ok) {
              const data = await res.json();
              updateShoppingListCache(planId, data);
              return data;
          }
      } catch (error) {
          console.error(`Error fetching shopping list ${planId}`, error);
      }
      return null;
  };

  const updateShoppingListCache = useCallback((planId: string, list: ShoppingList) => {
      setCachedShoppingLists(prev => {
          const newState = { ...prev, [planId]: list };
          localStorage.setItem('nutriflow_shopping_lists_cache', JSON.stringify(newState));
          return newState;
      });
  }, []);

  // --- Plan Details Caching ---
  const getPlanDetails = useCallback(async (planId: string): Promise<Plan | null> => {
      // Use Ref to avoid dependency on state which causes recreation on every update -> infinite loop
      if (cachedPlanDetailsRef.current[planId]) {
          fetchPlanDetailsBackground(planId);
          return cachedPlanDetailsRef.current[planId];
      }
      return await fetchPlanDetailsBackground(planId);
  }, [user, supabase]); // Removed cachedPlanDetails dependency

  const fetchPlanDetailsBackground = async (planId: string): Promise<Plan | null> => {
      if (!user) return null;
      try {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          if (!token) return null;

          const res = await fetch(`/api/plans/${planId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (res.ok) {
              const data = await res.json();
              updatePlanCache(data);
              return data;
          }
      } catch (error) {
           console.error(`Error fetching plan details ${planId}`, error);
      }
      return null;
  };

  const updatePlanCache = useCallback((plan: Plan) => {
      setCachedPlanDetails(prev => {
          const newState = { ...prev, [plan.id]: plan };
          try {
             localStorage.setItem('nutriflow_plan_details_cache', JSON.stringify(newState));
          } catch (e) {
             console.warn('LocalStorage full, cannot cache plan details');
          }
          return newState;
      });
  }, []);

  // --- Exercise Plan Caching ---
  const updateExercisePlanCache = useCallback((planId: string, plan: ExercisePlan) => {
      setCachedExercisePlans(prev => {
          const newState = { ...prev, [planId]: plan };
          try {
              localStorage.setItem('nutriflow_exercise_plans_cache', JSON.stringify(newState));
          } catch (e) { console.warn('LocalStorage full (exercise)'); }
          return newState;
      });
  }, []);

  const getExercisePlan = useCallback(async (planId: string): Promise<ExercisePlan | null> => {
      // Use Ref for stability
      if (cachedExercisePlansRef.current[planId]) {
          fetchExercisePlanBackground(planId);
          return cachedExercisePlansRef.current[planId];
      }
      return await fetchExercisePlanBackground(planId);
  }, [user, supabase]); // Removed cachedExercisePlans dependency

  const fetchExercisePlanBackground = async (planId: string): Promise<ExercisePlan | null> => {
      if (!user) return null;
      try {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          if (!token) return null;

          const res = await fetch(`/api/exercise-plans/${planId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (res.ok) {
              const data = await res.json();
              updateExercisePlanCache(planId, data);
              return data;
          }
      } catch (error) {
           console.error(`Error fetching exercise plan ${planId}`, error);
      }
      return null;
  };

  useEffect(() => {
    if (user) {
        fetchPlans();
    } else {
        setPlans([]);
        setCachedShoppingLists({});
        setCachedPlanDetails({});
        setCachedExercisePlans({});
        localStorage.removeItem('nutriflow_plans_cache');
        localStorage.removeItem('nutriflow_shopping_lists_cache');
        localStorage.removeItem('nutriflow_plan_details_cache');
        localStorage.removeItem('nutriflow_exercise_plans_cache');
    }
  }, [user, fetchPlans]);

  return (
    <PlansContext.Provider value={{ 
        plans, 
        isLoadingPlans, 
        refreshPlans: fetchPlans,
        cachedShoppingLists,
        getShoppingList,
        updateShoppingListCache,
        cachedPlanDetails,
        cachedExercisePlans,
        getPlanDetails,
        getExercisePlan,
        updatePlanCache,
        updateExercisePlanCache
    }}>
      {children}
    </PlansContext.Provider>
  );
}

export function usePlans() {
  const context = useContext(PlansContext);
  if (context === undefined) {
    throw new Error('usePlans must be used within a PlansProvider');
  }
  return context;
}
