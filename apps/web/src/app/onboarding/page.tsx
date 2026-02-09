'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import {
  Utensils,
  ArrowRight,
  ArrowLeft,
  Loader2,
  User,
  Activity,
  Target,
  Shield,
  Check,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { Sex, ActivityLevel, DietPattern } from '@nutriflow/shared';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/context/ToastContext';
import { useUser } from '@/context/UserContext';
import { useLanguage } from '@/context/LanguageContext';

interface Allergen {
  id: string;
  name: string;
  description?: string;
}

const profileSchema = z.object({
  username: z.string().min(3, 'username_short').max(20)
    .regex(/^[a-zA-Z0-9_]+$/, 'username_chars'),
  age: z.number().min(18, 'age_min').max(100),
  sex: z.nativeEnum(Sex),
  weightKg: z.number().min(30).max(300),
  heightCm: z.number().min(100).max(250),
  activityLevel: z.nativeEnum(ActivityLevel),
  mealsPerDay: z.number().min(2).max(6),
  dietPattern: z.nativeEnum(DietPattern),
  weightGoalKg: z.number().min(30).max(300).optional(),
  allergenIds: z.array(z.string()).default([]),
  healthConditions: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { refreshProfile } = useUser();
  const { t } = useLanguage();

  const STEPS = [
    { id: 'basics', title: t('onboarding.step_basics'), icon: User },
    { id: 'activity', title: t('onboarding.step_activity'), icon: Activity },
    { id: 'goals', title: t('onboarding.step_goals'), icon: Target },
    { id: 'allergens', title: t('onboarding.step_allergens'), icon: Shield },
    { id: 'safety', title: t('onboarding.step_safety'), icon: AlertTriangle },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [loadingStep, setLoadingStep] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      mealsPerDay: 3,
      dietPattern: DietPattern.OMNIVORE,
      activityLevel: ActivityLevel.MODERATELY_ACTIVE,
      allergenIds: [],
    },
  });
  
  const currentWeight = watch('weightKg');
  const selectedAllergens = watch('allergenIds');

  // Load allergens and generate username
  useEffect(() => {
    async function init() {
      // 1. Fetch Allergens
      try {
        const res = await fetch('/api/allergens');
        if (res.ok) {
           const data = await res.json();
           setAllergens(data);
        }
      } catch (err) {
        console.error('Error loading allergens', err);
      }

      // 2. Generate Username Suggestion (if empty)
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.email) {
          const emailPrefix = user.email.split('@')[0];
          const cleanUsername = emailPrefix
            .replace(/[^a-zA-Z0-9]/g, '_')
            .toLowerCase()
            .substring(0, 15);
          
          const randomSuffix = Math.floor(Math.random() * 1000);
          const usernameSuggestion = `${cleanUsername}${randomSuffix}`;
          console.log('Username suggestion:', usernameSuggestion);
        }
      } catch (error) {
        console.error('Error getting user', error);
      }
    }
    init();
  }, []);

  const nextStep = async () => {
    // Validate current step fields
    const fieldsToValidate: (keyof ProfileFormData)[][] = [
      ['username', 'age', 'sex', 'weightKg', 'heightCm'],
      ['activityLevel', 'mealsPerDay'],
      ['dietPattern', 'weightGoalKg'],
      ['allergenIds', 'healthConditions'],
      [], // Safety confirmation step doesn't have form fields in the same way (just a review)
    ];

    const isValid = await trigger(fieldsToValidate[currentStep]);
    if (isValid && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentStep < STEPS.length - 1) {
      e.preventDefault();
      nextStep();
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setLoadingStep(t('onboarding.loading_profile'));
    
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) throw new Error('No session');

      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // 1. Save Profile (Sanitize data to exclude fields not in DTO)
      const { allergenIds, ...profileData } = data;
      
      console.log('Saving profile data:', profileData);
      
      const profileRes = await fetch('/api/me/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify(profileData),
      });

      if (!profileRes.ok) {
        const errorData = await profileRes.json().catch(() => ({}));
        console.error('Profile save error:', errorData);
        throw new Error(errorData.message || 'Error saving profile');
      }

      // Sync Navbar / Profile immediately
      await refreshProfile();

      // 2. Save Allergens (if any)
      if (allergenIds && allergenIds.length > 0) {
        setLoadingStep(t('onboarding.loading_allergens'));
        console.log('Saving allergens:', allergenIds);
        const allergensRes = await fetch('/api/me/allergens', {
          method: 'PUT',
          headers,
          body: JSON.stringify({ allergenIds }),
        });
        
        if (!allergensRes.ok) {
          console.warn('Error saving allergens, but continuing...');
        }
      }

      // 3. Generate Plan
      setLoadingStep(t('onboarding.loading_plan'));
      const planRes = await fetch('/api/plans/generate-week', {
        method: 'POST',
        headers,
        body: JSON.stringify({ useAi: true }),
      });

      if (planRes.ok) {
        const plan = await planRes.json();
        showToast(t('onboarding.success'), 'success');
        router.push(`/plan/${plan.id}`);
      } else {
        // Detect Quota Error (429 or nested in 400/500)
        const errorData = await planRes.json().catch(() => ({}));
        const isQuotaError = planRes.status === 429 || 
                           JSON.stringify(errorData).toLowerCase().includes('quota');

        if (isQuotaError) {
          showToast(t('onboarding.quota_error'), 'warning');
        } else {
          showToast(t('onboarding.gen_error'), 'warning');
        }
        
        console.warn('Plan generation non-ideal response:', planRes.status, errorData);
        router.push('/dashboard'); 
      }

    } catch (error: any) {
      console.error('Error in onboarding:', error);
      showToast(error.message || 'Error al completar el registro.', 'error');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="min-h-screen bg-page-gradient py-8 sm:py-12 pt-20 sm:pt-24 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
            <Utensils className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600" />
            <span className="text-xl sm:text-2xl font-heading font-bold text-primary-600 dark:text-primary-400">
              NutriFlow
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-surface-900 dark:text-white mb-2">
            {t('onboarding.title')}
          </h1>
          <p className="text-sm sm:text-base text-surface-600 dark:text-surface-300">
            {t('onboarding.subtitle')}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                  index <= currentStep
                    ? 'bg-primary-600 text-white'
                    : 'bg-surface-200 text-surface-500'
                }`}
              >
                <step.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`w-8 sm:w-12 h-1 mx-1 sm:mx-2 ${
                    index < currentStep ? 'bg-primary-600' : 'bg-surface-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="card">
          <h2 className="text-xl font-heading font-semibold text-surface-900 dark:text-white mb-6">
            {STEPS[currentStep].title}
          </h2>

          <form 
            onSubmit={handleSubmit(onSubmit)} 
            onKeyDown={handleKeyDown}
            className="space-y-6"
          >
            {/* Step 1: Basics */}
            {currentStep === 0 && (
              <>
                <div className="mb-4">
                  <label className="label">{t('onboarding.username_label')}</label>
                  <input
                    {...register('username')}
                    type="text"
                    className="input"
                    placeholder="nutri_user"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{t(`errors.${errors.username.message}`)}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">{t('onboarding.age_label')}</label>
                    <input
                      {...register('age', { valueAsNumber: true })}
                      type="number"
                      className="input"
                      placeholder="30"
                    />
                    {errors.age && (
                      <p className="mt-1 text-sm text-red-600">{t(`errors.${errors.age.message}`)}</p>
                    )}
                  </div>
                  <div>
                    <label className="label">{t('onboarding.sex_label')}</label>
                    <select {...register('sex')} className="input">
                      <option value={Sex.MALE}>{t('onboarding.sex_male')}</option>
                      <option value={Sex.FEMALE}>{t('onboarding.sex_female')}</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">{t('onboarding.weight_label')}</label>
                    <input
                      {...register('weightKg', { valueAsNumber: true })}
                      type="number"
                      step="0.1"
                      className="input"
                      placeholder="75"
                    />
                    {errors.weightKg && (
                      <p className="mt-1 text-sm text-red-600">{t(`errors.${errors.weightKg.message}`) || errors.weightKg.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="label">{t('onboarding.height_label')}</label>
                    <input
                      {...register('heightCm', { valueAsNumber: true })}
                      type="number"
                      className="input"
                      placeholder="175"
                    />
                    {errors.heightCm && (
                      <p className="mt-1 text-sm text-red-600">{t(`errors.${errors.heightCm.message}`) || errors.heightCm.message}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Activity */}
            {currentStep === 1 && (
              <>
                <div>
                  <label className="label">{t('onboarding.activity_label')}</label>
                  <select {...register('activityLevel')} className="input">
                    <option value={ActivityLevel.SEDENTARY}>
                      {t('onboarding.activity_sedentary')}
                    </option>
                    <option value={ActivityLevel.LIGHTLY_ACTIVE}>
                      {t('onboarding.activity_light')}
                    </option>
                    <option value={ActivityLevel.MODERATELY_ACTIVE}>
                      {t('onboarding.activity_moderate')}
                    </option>
                    <option value={ActivityLevel.VERY_ACTIVE}>
                      {t('onboarding.activity_very')}
                    </option>
                    <option value={ActivityLevel.EXTREMELY_ACTIVE}>
                      {t('onboarding.activity_extreme')}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="label">{t('onboarding.meals_label')}</label>
                  <select {...register('mealsPerDay', { valueAsNumber: true })} className="input">
                    <option value={3}>{t('onboarding.meals_3')}</option>
                    <option value={4}>{t('onboarding.meals_4')}</option>
                    <option value={5}>{t('onboarding.meals_5')}</option>
                  </select>
                </div>
              </>
            )}

            {/* Step 3: Goals */}
            {currentStep === 2 && (
              <>
                <div>
                  <label className="label">{t('onboarding.diet_label')}</label>
                  <select {...register('dietPattern')} className="input">
                    <option value={DietPattern.OMNIVORE}>{t('onboarding.diet_omnivore')}</option>
                    <option value={DietPattern.VEGETARIAN}>{t('onboarding.diet_vegetarian')}</option>
                    <option value={DietPattern.VEGAN}>{t('onboarding.diet_vegan')}</option>
                    <option value={DietPattern.PESCATARIAN}>{t('onboarding.diet_pescatarian')}</option>
                  </select>
                </div>
                <div>
                  <label className="label">{t('onboarding.goal_weight_label')}</label>
                  <input
                    {...register('weightGoalKg', { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    className="input"
                    placeholder={currentWeight ? String(currentWeight - 5) : '70'}
                  />
                  <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
                    {t('onboarding.current_weight_ref')}: {currentWeight || '--'} kg
                  </p>
                </div>

                {/* Disclaimer */}
                <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    {t('onboarding.disclaimer')}
                  </p>
                </div>
              </>
            )}

             {/* Step 4: Allergens */}
             {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-surface-600 dark:text-surface-300 mb-4">
                  {t('onboarding.allergens_desc')}
                </p>

                {/* Modern "No Allergies" Card */}
                <label 
                  className={`relative flex items-center p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 overflow-hidden group mb-6 ${
                    selectedAllergens?.length === 0
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                      : 'border-surface-200 dark:border-surface-700 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-surface-50 dark:hover:bg-surface-800'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent transition-opacity duration-300 ${
                    selectedAllergens?.length === 0 ? 'opacity-100' : 'opacity-0'
                  }`} />
                  
                  <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mr-4 transition-transform duration-300 group-hover:scale-110">
                      {selectedAllergens?.length === 0 ? <ShieldCheck className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                  </div>

                  <div className="relative z-10 flex-1">
                    <span className={`block font-heading font-bold text-lg mb-0.5 transition-colors ${
                      selectedAllergens?.length === 0
                        ? 'text-emerald-800 dark:text-emerald-300'
                        : 'text-surface-700 dark:text-surface-200'
                    }`}>
                      {t('onboarding.allergens_none_label')}
                    </span>
                    <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">
                      {t('onboarding.allergens_plan_confirm')}
                    </p>
                  </div>

                  <div className={`relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                     selectedAllergens?.length === 0
                       ? 'border-emerald-500 bg-emerald-500 scale-110'
                       : 'border-surface-300 dark:border-surface-600'
                  }`}>
                     {selectedAllergens?.length === 0 && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  </div>

                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedAllergens?.length === 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setValue('allergenIds', []);
                      }
                    }}
                  />
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {allergens.length === 0 && (
                    <div className="col-span-2 text-center py-6 text-surface-500">
                      {t('onboarding.allergens_none_found')}
                    </div>
                  )}
                  {allergens.map((allergen) => (
                    <label 
                      key={allergen.id}
                      className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                        selectedAllergens?.includes(allergen.id)
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-surface-200 dark:border-surface-700 hover:border-surface-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={allergen.id}
                        {...register('allergenIds')}
                        className="sr-only"
                      />
                      <div className="flex-1">
                         <span className={`font-medium ${
                            selectedAllergens?.includes(allergen.id)
                            ? 'text-primary-700 dark:text-primary-300' 
                            : 'text-surface-700 dark:text-surface-200'
                         }`}>
                           {/* Try to translate using name (e.g. 'allergen.gluten') or fallback to name/id */}
                           {t('allergen.' + (allergen.name?.toLowerCase() || '')) !== 'allergen.' + (allergen.name?.toLowerCase() || '') 
                              ? t('allergen.' + (allergen.name?.toLowerCase() || ''))
                              : (allergen.name || t('allergen.' + allergen.id))}
                         </span>
                         {allergen.description && (
                            <p className="text-xs text-surface-500 mt-0.5">{allergen.description}</p>
                         )}
                      </div>
                      {selectedAllergens?.includes(allergen.id) && (
                        <Check className="w-5 h-5 text-primary-600" />
                      )}
                    </label>
                  ))}
                </div>

                 <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl mt-6">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    {t('onboarding.disclaimer')}
                  </p>
                </div>

                {/* Explicit Confirmation Block */}
                <div className="mt-8 p-6 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selectedAllergens?.length > 0 
                        ? 'bg-amber-100 text-amber-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {selectedAllergens?.length > 0 ? <Shield className="w-6 h-6" /> : <Check className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-surface-900 dark:text-white">
                        {selectedAllergens?.length > 0 
                          ? `${selectedAllergens.length} ${t('onboarding.allergens_selected')}` 
                          : t('onboarding.allergens_none_selected')}
                      </h3>
                      <p className="text-sm text-surface-600 dark:text-surface-400">
                        {selectedAllergens?.length > 0 
                          ? t('onboarding.allergens_plan_avoid') 
                          : t('onboarding.allergens_plan_confirm')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Health Conditions Free Text */}
                <div className="mt-8">
                  <label className="label mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary-500" />
                    {t('onboarding.health_conditions_label')}
                  </label>
                  <textarea
                    {...register('healthConditions')}
                    className="input min-h-[100px] text-sm"
                    placeholder={t('onboarding.health_conditions_placeholder')}
                  />
                  <p className="mt-2 text-xs text-surface-500 italic">
                    {t('onboarding.health_conditions_hint')}
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Safety Review (Intermediate Step) */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-900/30">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-bold text-amber-900 dark:text-amber-200">
                        {t('onboarding.safety_title')}
                      </h3>
                      <p className="text-sm text-amber-800 dark:text-amber-300">
                        {t('onboarding.safety_desc')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 bg-white dark:bg-surface-800 p-4 rounded-xl border border-amber-100 dark:border-amber-900/20">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold uppercase tracking-wider text-surface-400">{t('onboarding.review_allergens')}</span>
                      <span className="text-sm font-medium text-surface-900 dark:text-white">
                        {selectedAllergens?.length > 0 ? selectedAllergens.length : t('onboarding.none')}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-surface-400">{t('onboarding.review_conditions')}</span>
                      <p className="text-sm font-medium text-surface-900 dark:text-white break-words">
                        {watch('healthConditions') || t('onboarding.none')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-900/30">
                  <ShieldCheck className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                  <p className="text-sm text-primary-900 dark:text-primary-300">
                    {t('onboarding.safety_confirmation_text')}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('onboarding.nav_prev')}
                </button>
              ) : (
                <div />
              )}

              {currentStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary flex items-center gap-2 group"
                >
                  {t('onboarding.nav_next')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`btn-primary flex items-center justify-center gap-2 min-w-[200px] py-4 text-lg shadow-xl transition-all duration-500 ${
                    selectedAllergens?.length === 0 
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' 
                      : 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/20'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="font-medium">{loadingStep}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-bold">{t('onboarding.nav_submit')}</span>
                      <SparklesIcon className="w-5 h-5 animate-pulse" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Helper component since we don't import Sparkles but used it in last button
function SparklesIcon({ className }: { className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    )
}
