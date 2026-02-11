'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Sex, ActivityLevel, DietPattern } from '@nutriflow/shared';
import { Loader2, Sparkles, AlertCircle, ArrowRight, Utensils } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MealCard } from './MealCard';
import { MacroBadge } from './MacroBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';

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
  const [isSaving, setIsSaving] = useState(false); // New state for save button
  const [plan, setPlan] = useState<any | null>(null);
  const [error, setError] = useState('');
  const supabase = createClient();
  const router = useRouter();
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  const { register, handleSubmit, getValues } = useForm<DietFormData>({
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
        throw new Error(t('gen.error_auth'));
      }

      const allergenIds = data.allergens ? data.allergens.split(',').map(s => s.trim()) : [];

      const payload = {
        ...data,
        allergenIds,
        id: 'temp-id',
        language: language // Pass current language for AI generation
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
        throw new Error(t('gen.error_gen'));
      }

      const result = await response.json();
      setPlan(result);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlan = async () => {
    setIsSaving(true);
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            throw new Error(t('settings.session_error'));
        }

        const formData = getValues();

        // 1. Update Profile (PUT /me/profile)
        const profilePayload = {
            age: Number(formData.age),
            sex: formData.sex,
            weightKg: Number(formData.weightKg),
            heightCm: Number(formData.heightCm),
            activityLevel: formData.activityLevel,
            dietPattern: formData.dietPattern,
            mealsPerDay: Number(formData.mealsPerDay),
            weightGoalKg: formData.weightGoalKg ? Number(formData.weightGoalKg) : undefined,
            language: language // Sync current UI language to profile
        };

        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify(profilePayload)
        });

        if (!profileRes.ok) throw new Error(t('settings.error'));

        // 3. Generate Official Plan (POST /plans/generate-week)
        const planRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/plans/generate-week`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
                weekStart: undefined, // Defaults to next Monday
                useAi: false, // Using rules engine for consistency
                language: language // Pass language to generator
            })
        });

        if (!planRes.ok) throw new Error(t('gen.error_save'));

        const savedPlan = await planRes.json();
        
        showToast(t('gen.success_save'), 'success');
        
        // 4. Redirect
        router.push(`/plan/${savedPlan.id}`);

    } catch (error: any) {
        console.error('Save error:', error);
        showToast(error.message || t('gen.error_save'), 'error');
    } finally {
        setIsSaving(false);
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
        <h2 className="text-5xl font-heading font-black text-surface-900 dark:text-white tracking-tight">
          {t('gen.title')}
        </h2>
        <p className="text-surface-500 dark:text-surface-400 max-w-2xl mx-auto text-lg">
          {t('gen.subtitle')}
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-[400px_1fr] gap-12 items-start">
        {/* Form Column */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-surface-800 rounded-3xl border border-surface-100 dark:border-surface-700 shadow-xl p-8 sticky top-24 transition-colors duration-300"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h3 className="text-xl font-heading font-black text-surface-900 dark:text-white border-b border-surface-50 dark:border-surface-700 pb-4">
              {t('gen.profile_title')}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-widest text-surface-400 ml-1">{t('gen.age')}</label>
                <input 
                  type="number" 
                  {...register('age', { required: true, min: 18 })}
                  className="w-full p-4 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border-none focus:ring-2 focus:ring-primary-500 transition-all font-bold text-surface-900 dark:text-white"
                  placeholder="30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-widest text-surface-400 ml-1">{t('gen.sex')}</label>
                <select {...register('sex')} className="w-full p-4 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border-none focus:ring-2 focus:ring-primary-500 appearance-none font-bold text-surface-900 dark:text-white">
                  <option value={Sex.MALE}>{t('onboarding.sex_male')}</option>
                  <option value={Sex.FEMALE}>{t('onboarding.sex_female')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-widest text-surface-400 ml-1">{t('gen.weight')}</label>
                <input 
                  type="number" 
                  {...register('weightKg', { required: true })}
                  className="w-full p-4 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border-none focus:ring-2 focus:ring-primary-500 font-bold text-surface-900 dark:text-white"
                  placeholder="75"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-widest text-surface-400 ml-1">{t('gen.height')}</label>
                <input 
                  type="number" 
                  {...register('heightCm', { required: true })}
                  className="w-full p-4 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border-none focus:ring-2 focus:ring-primary-500 font-bold text-surface-900 dark:text-white"
                  placeholder="175"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-widest text-surface-400 ml-1">{t('gen.diet_type')}</label>
                  <select {...register('dietPattern')} className="w-full p-4 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border-none focus:ring-2 focus:ring-primary-500 font-bold text-surface-900 dark:text-white">
                    <option value={DietPattern.OMNIVORE}>{t('onboarding.diet_omnivore')}</option>
                    <option value={DietPattern.VEGETARIAN}>{t('onboarding.diet_vegetarian')}</option>
                    <option value={DietPattern.VEGAN}>{t('onboarding.diet_vegan')}</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-widest text-surface-400 ml-1">{t('gen.restrictions')}</label>
                  <input 
                    type="text" 
                    {...register('allergens')}
                    className="w-full p-4 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border-none focus:ring-2 focus:ring-primary-500 font-bold text-sm text-surface-900 dark:text-white"
                    placeholder={t('gen.restrictions_placeholder')}
                  />
                </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-surface-900 dark:bg-white text-white dark:text-surface-900 hover:bg-surface-800 dark:hover:bg-surface-100 font-black py-5 rounded-3xl transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl disabled:opacity-70 mt-8 group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('gen.loading')}</span>
                </>
              ) : (
                <>
                  <span>{t('gen.submit')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center gap-3 text-sm font-bold"
              >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
              </motion.div>
            )}
          </form>
        </motion.div>

        {/* Results Column */}
        <div className="space-y-8 min-h-[600px] flex flex-col items-center justify-center border-2 border-dashed border-surface-100 dark:border-surface-700 rounded-[40px] p-12 bg-white/30 dark:bg-surface-800/20 transition-colors duration-300">
          {!plan && !isLoading && (
            <div className="text-center space-y-4 opacity-30 select-none">
              <div className="w-24 h-24 bg-surface-50 dark:bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Utensils className="w-10 h-10 text-surface-300 dark:text-surface-600" />
              </div>
              <h4 className="text-xl font-heading font-black text-surface-900 dark:text-white">{t('gen.empty_title')}</h4>
              <p className="max-w-xs mx-auto font-bold text-sm text-surface-500 dark:text-surface-400">{t('gen.empty_desc')}</p>
            </div>
          )}

          <AnimatePresence>
            {plan && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full space-y-10"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-surface-50 dark:border-surface-700 pb-8">
                  <div>
                    <h3 className="text-4xl font-heading font-black text-surface-900 dark:text-white tracking-tight">{t('gen.result_title')}</h3>
                    <p className="text-primary-600 dark:text-primary-400 font-bold mt-2">
                       {t('gen.result_subtitle').replace('{{count}}', (plan.days?.length || 0).toString())}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <MacroBadge label={t('macros.cal_short')} value={plan.targetKcal} color="calories" />
                    <MacroBadge label={t('macros.prot_short')} value={plan.targetProtein} color="protein" />
                    <MacroBadge label={t('macros.carb_short')} value={plan.targetCarbs} color="carbs" />
                    <MacroBadge label={t('macros.fat_short')} value={plan.targetFat} color="fat" />
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
                
                <div className="bg-primary-50 dark:bg-primary-900/10 rounded-3xl p-6 flex items-center justify-between gap-6 border border-primary-100 dark:border-primary-800 transition-colors duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-200">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h5 className="font-heading font-black text-surface-900 dark:text-white">{t('gen.save_title')}</h5>
                      <p className="text-xs font-bold text-surface-500 dark:text-surface-400">{t('gen.save_desc')}</p>
                    </div>
                  </div>
                  <button 
                      onClick={handleSavePlan}
                      disabled={isSaving}
                      className="bg-white dark:bg-surface-800 px-6 py-3 rounded-2xl font-black text-sm text-surface-900 dark:text-white hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isSaving ? t('gen.saving') : t('gen.save_btn')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading && (
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-primary-50 dark:border-primary-900 rounded-full mx-auto" />
                <div className="w-24 h-24 border-4 border-t-primary-600 border-transparent rounded-full mx-auto animate-spin absolute inset-0" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-heading font-black text-primary-600 animate-pulse">{t('gen.analyzing_library')}</h4>
                <p className="max-w-xs mx-auto font-bold text-sm text-surface-400 dark:text-surface-500">{t('gen.analyzing_desc')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
