'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '@/lib/i18n';
import { createClient } from '@/lib/supabase/client';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');
  const [isLiveTranslating, setIsLiveTranslating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Initial load from localStorage for speed
    const savedLang = localStorage.getItem('nutriflow_lang') as Language;
    if (savedLang) {
      setLanguage(savedLang);
    }

    // Then sync with Supabase profile if logged in
    const syncWithProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('language')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.language && profile.language !== savedLang) {
          setLanguage(profile.language as Language);
          localStorage.setItem('nutriflow_lang', profile.language);
        }
      }
    };

    syncWithProfile();
  }, []);

  const handleSetLanguage = async (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('nutriflow_lang', lang);

    // Sync to DB if logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setIsLiveTranslating(true);
      try {
        await supabase
          .from('profiles')
          .update({ language: lang })
          .eq('id', session.user.id);
        
        // Note: Translation bridge trigger will be implemented next
      } finally {
        setIsLiveTranslating(false);
      }
    }
  };

  const t = (key: string): string => {
    // @ts-ignore
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
      {isLiveTranslating && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center space-x-2 bg-surface-900/80 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm animate-pulse">
           <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
           <span className="text-xs font-medium">NutriFlow IA Translating...</span>
        </div>
      )}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
