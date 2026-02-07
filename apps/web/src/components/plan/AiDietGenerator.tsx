'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Sex, ActivityLevel, DietPattern } from '@nutriflow/shared';
import { Loader2, Sparkles, AlertCircle, ArrowRight, Utensils } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MealCard } from './MealCard';
import { MacroBadge } from './MacroBadge';
import { motion, AnimatePresence } from 'framer-motion';

interface DietFormData {
  age: number;
  sex: Sex;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  dietPattern: DietPattern;
  weightGoalKg?: number;
  mealsPerDay: number;
  allergens: string; // Comma separated for now
}

export function AiDietGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<any | null>(null);
  const [error, setError] = useState('');
  const supabase = createClient();

  const { register, handleSubmit } = useForm<DietFormData>({
    defaultValues: {
      mealsPerDay: 3,
      activityLevel: ActivityLevel.SEDENTARY,
      dietPattern: DietPattern.OMNIVORE,
      sex: Sex.MALE,
    }
  });

  const onSubmit = async (data: DietFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Debes iniciar sesión para generar una dieta.');
      }

      const allergenIds = data.allergens ? data.allergens.split(',').map(s => s.trim()) : [];

      const payload = {
        ...data,
        allergenIds,
        id: 'temp-id',
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/diet-engine/generate-ai`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Error generando la dieta. Por favor intenta de nuevo.');
      }

      const result = await response.json();
      setPlan(result);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 pb-20">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-xs font-black uppercase tracking-widest shadow-sm">
          <Sparkles className="w-4 h-4" />
          Powered by NotebookLM
        </div>
        <h2 className="text-5xl font-heading font-black text-surface-900 tracking-tight">
          Generador de Dieta con <span className="text-primary-600 italic">IA</span>
        </h2>
        <p className="text-surface-500 max-w-2xl mx-auto text-lg">
          Creamos un plan nutricional único basado en tu ciencia biológica y los últimos conocimientos médicos.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-[400px_1fr] gap-12 items-start">
        {/* Form Column */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl border border-surface-100 shadow-xl p-8 sticky top-24"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h3 className="text-xl font-heading font-black text-surface-900 border-b border-surface-50 pb-4">
              Tu Perfil
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-widest text-surface-400 ml-1">Edad</label>
                <input 
                  type="number" 
                  {...register('age', { required: true, min: 18 })}
                  className="w-full p-4 rounded-2xl bg-surface-50 border-none focus:ring-2 focus:ring-primary-500 transition-all font-bold"
                  placeholder="30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-widest text-surface-400 ml-1">Sexo</label>
                <select {...register('sex')} className="w-full p-4 rounded-2xl bg-surface-50 border-none focus:ring-2 focus:ring-primary-500 appearance-none font-bold">
                  <option value={Sex.MALE}>Hombre</option>
                  <option value={Sex.FEMALE}>Mujer</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-widest text-surface-400 ml-1">Peso (kg)</label>
                <input 
                  type="number" 
                  {...register('weightKg', { required: true })}
                  className="w-full p-4 rounded-2xl bg-surface-50 border-none focus:ring-2 focus:ring-primary-500 font-bold"
                  placeholder="75"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-widest text-surface-400 ml-1">Altura (cm)</label>
                <input 
                  type="number" 
                  {...register('heightCm', { required: true })}
                  className="w-full p-4 rounded-2xl bg-surface-50 border-none focus:ring-2 focus:ring-primary-500 font-bold"
                  placeholder="175"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-widest text-surface-400 ml-1">Tipo de Dieta</label>
                  <select {...register('dietPattern')} className="w-full p-4 rounded-2xl bg-surface-50 border-none focus:ring-2 focus:ring-primary-500 font-bold">
                    <option value={DietPattern.OMNIVORE}>Omnívora</option>
                    <option value={DietPattern.VEGETARIAN}>Vegetariana</option>
                    <option value={DietPattern.VEGAN}>Vegana</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-widest text-surface-400 ml-1">Restricciones</label>
                  <input 
                    type="text" 
                    {...register('allergens')}
                    className="w-full p-4 rounded-2xl bg-surface-50 border-none focus:ring-2 focus:ring-primary-500 font-bold text-sm"
                    placeholder="E.g. gluten, soja, nueces"
                  />
                </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-surface-900 hover:bg-surface-800 text-white font-black py-5 rounded-3xl transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl disabled:opacity-70 mt-8 group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analizando fuentes de confianza...</span>
                </>
              ) : (
                <>
                  <span>Generar Dieta Mágica</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 text-sm font-bold"
              >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
              </motion.div>
            )}
          </form>
        </motion.div>

        {/* Results Column */}
        <div className="space-y-8 min-h-[600px] flex flex-col items-center justify-center border-2 border-dashed border-surface-100 rounded-[40px] p-12">
          {!plan && !isLoading && (
            <div className="text-center space-y-4 opacity-30 select-none">
              <div className="w-24 h-24 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Utensils className="w-10 h-10 text-surface-300" />
              </div>
              <h4 className="text-xl font-heading font-black text-surface-900">Tu plan aparecerá aquí</h4>
              <p className="max-w-xs mx-auto font-bold text-sm">Configura tu perfil a la izquierda y pulsa el botón para comenzar el análisis.</p>
            </div>
          )}

          <AnimatePresence>
            {plan && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full space-y-10"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-surface-50 pb-8">
                  <div>
                    <h3 className="text-4xl font-heading font-black text-surface-900 tracking-tight">Resultado del Análisis</h3>
                    <p className="text-primary-600 font-bold mt-2">Plan generado con {plan.days?.length} días de balance nutricional.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <MacroBadge label="Kcal" value={plan.targetKcal} color="calories" />
                    <MacroBadge label="Prot" value={plan.targetProtein} color="protein" />
                    <MacroBadge label="Carb" value={plan.targetCarbs} color="carbs" />
                    <MacroBadge label="Fat" value={plan.targetFat} color="fat" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {plan.days?.[0]?.meals?.map((meal: any) => (
                    <MealCard 
                      key={meal.id || Math.random()} 
                      meal={meal} 
                      onToggleLock={() => {}} 
                      onRegenerate={() => {}} 
                    />
                  ))}
                </div>
                
                <div className="bg-primary-50 rounded-3xl p-6 flex items-center justify-between gap-6 border border-primary-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-200">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h5 className="font-heading font-black text-surface-900">¿Te gusta este plan?</h5>
                      <p className="text-xs font-bold text-surface-500">Puedes guardarlo y activarlo desde tu panel principal.</p>
                    </div>
                  </div>
                  <button className="bg-white px-6 py-3 rounded-2xl font-black text-sm text-surface-900 hover:shadow-md transition-all">
                    Guardar Plan
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading && (
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-primary-50 rounded-full mx-auto" />
                <div className="w-24 h-24 border-4 border-t-primary-600 border-transparent rounded-full mx-auto animate-spin absolute inset-0" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-heading font-black text-primary-600 animate-pulse">Analizando biblioteca...</h4>
                <p className="max-w-xs mx-auto font-bold text-sm text-surface-400">Nuestro algoritmo está consultando NutriFLow Biblioteca para encontrar la mejor combinación para ti.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
