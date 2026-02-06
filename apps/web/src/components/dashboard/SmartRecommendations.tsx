'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Activity, Info, ChevronRight, Loader2, Database } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Recommendation {
  doc_id: string;
  category: string;
  content: string;
  reason: string;
}

const getCardVisuals = (category: string, reason: string) => {
  const c = category.toLowerCase();
  const r = reason.toLowerCase();

  if (c.includes('seguridad') || r.includes('seguridad')) {
    return {
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2676&auto=format&fit=crop', // Tech/Abstract Security
      icon: ShieldCheck,
      color: 'amber',
      label: 'Protocolo de Seguridad'
    };
  }
  if (r.includes('imc') || r.includes('peso') || c.includes('metab')) {
    return {
      image: 'https://images.unsplash.com/photo-1550989460-a5fb975ba699?q=80&w=2670&auto=format&fit=crop', // Health/Scale (Updated)
      icon: Activity,
      color: 'blue',
      label: 'Análisis Biométrico'
    };
  }
  if (c.includes('base') || r.includes('sistema')) {
    return {
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop', // Data visualization / tech abstract
      icon: Database,
      color: 'purple',
      label: 'Base de Conocimiento'
    };
  }
  
  // Default healthy food / lifestyle
  return {
    image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=2532&auto=format&fit=crop',
    icon: Info,
    color: 'emerald',
    label: 'Recomendación General'
  };
};

export function SmartRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.rpc('get_user_recommendations', {
          target_user_id: user.id
        });

        if (error) {
          // If profile doesn't exist, just show no recommendations
          console.log('No recommendations available:', error.message);
          setRecommendations([]);
        } else {
          setRecommendations(data || []);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecommendations();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center p-8 sm:p-12 bg-white dark:bg-surface-800 rounded-2xl border border-surface-100 dark:border-surface-700 shadow-sm mb-6 sm:mb-8">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-2 sm:mb-0 sm:mr-3" />
        <span className="text-sm sm:text-base text-surface-600 dark:text-surface-300 font-medium text-center">Analizando tu perfil con NutriFlow IA...</span>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <section className="mb-8 sm:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="p-2 sm:p-2.5 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl shadow-lg shadow-primary-500/20">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-surface-900 dark:text-white leading-none mb-1">
            Recomendaciones <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400">Inteligentes</span>
            </h2>
            <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400">Basadas en tus biomarcadores y objetivos actuales</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {recommendations.map((rec) => {
          const visuals = getCardVisuals(rec.category, rec.reason);
          const Icon = visuals.icon;
          
          return (
          <div 
            key={rec.doc_id}
            className="group relative bg-white dark:bg-surface-800 rounded-3xl overflow-hidden shadow-xl shadow-surface-200/50 dark:shadow-black/20 border border-surface-100 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-500 flex flex-col"
          >
            {/* Image Header */}
            <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                <img 
                    src={visuals.image} 
                    alt={visuals.label}
                    className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                />
                
                {/* Category Badge */}
                <span className="absolute top-4 right-4 z-20 text-[10px] font-bold uppercase tracking-widest text-white bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
                    {visuals.label}
                </span>

                {/* Floating Icon */}
                <div className="absolute bottom-4 left-4 z-20">
                    <div className={`p-3 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg ${
                        visuals.color === 'amber' ? 'bg-amber-500/20 text-amber-300' :
                        visuals.color === 'blue' ? 'bg-blue-500/20 text-blue-300' :
                        visuals.color === 'purple' ? 'bg-purple-500/20 text-purple-300' :
                        'bg-emerald-500/20 text-emerald-300'
                    }`}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col relative">
                {/* Content */}
                <h3 className="text-xl font-heading font-bold text-surface-900 dark:text-white mb-2 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {rec.reason}
                </h3>
                
                <div className="w-12 h-1 bg-surface-100 dark:bg-surface-700 rounded-full mb-4 group-hover:bg-primary-500 transition-colors duration-500" />
                
                <p className="text-surface-600 dark:text-surface-300 text-sm leading-relaxed mb-6 line-clamp-3">
                  {rec.content.replace(/[#*]/g, '').substring(0, 150)}...
                </p>

                <div className="mt-auto pt-4 border-t border-surface-100 dark:border-surface-700/50 flex items-center justify-between">
                    <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                        NutriFlow AI Engine
                    </span>
                    <Link 
                    href={`/protocols/${rec.doc_id}`}
                    className="flex items-center text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors group/btn"
                    >
                    Leer detalle
                    <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                </div>
            </div>
          </div>
        );
        })}
      </div>
    </section>
  );
}
