'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Activity,
  AlertTriangle as AlertIcon,
} from 'lucide-react';
import { Sex, ActivityLevel, DietPattern } from '@nutriflow/shared';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/context/ToastContext';
import { useUser } from '@/context/UserContext';
import { useLanguage } from '@/context/LanguageContext';

const profileSchema = z.object({
  username: z.string()
    .min(3, 'username_short')
    .max(20, 'username_short')
    .regex(/^[a-zA-Z0-9_]+$/, 'username_chars')
    .optional(),

  age: z.number().min(18, 'age_min').max(100, 'age_max'),
  sex: z.nativeEnum(Sex),
  weightKg: z.number().min(30, 'weight_range').max(300, 'weight_range'),
  heightCm: z.number().min(100, 'height_range').max(250, 'height_range'),
  activityLevel: z.nativeEnum(ActivityLevel),
  mealsPerDay: z.number().min(2, 'meals_range').max(6, 'meals_range'),
  dietPattern: z.nativeEnum(DietPattern),
  weightGoalKg: z.number().min(30, 'weight_goal_range').max(300, 'weight_goal_range').optional(),
  healthConditions: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function SettingsPage() {

  const { t } = useLanguage();
  const { showToast } = useToast();
  const { profile, refreshProfile } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [availableAllergens, setAvailableAllergens] = useState<{ id: string; name: string }[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Static definition of supported allergens to ensure translation keys exist
  const SUPPORTED_ALLERGENS = [
    { id: 'gluten', name: 'Gluten' },
    { id: 'dairy', name: 'Dairy' },
    { id: 'eggs', name: 'Eggs' },
    { id: 'peanuts', name: 'Peanuts' },
    { id: 'nuts', name: 'Nuts' },
    { id: 'soy', name: 'Soy' },
    { id: 'fish', name: 'Fish' },
    { id: 'shellfish', name: 'Shellfish' },
  ];

  useEffect(() => {
    if (profile) {
      reset({
        username: profile.username || '',
        age: profile.age,
        sex: profile.sex as Sex,
        weightKg: profile.weight_kg,
        heightCm: profile.height_cm,
        activityLevel: profile.activity_level as ActivityLevel,
        mealsPerDay: profile.meals_per_day,
        dietPattern: profile.diet_pattern as DietPattern,
        weightGoalKg: profile.weight_goal_kg,
        healthConditions: profile.healthConditions || '',
      });
      setIsLoading(false);
    }
    
    // Set available allergens from static list immediately
    setAvailableAllergens(SUPPORTED_ALLERGENS);
    
    loadUserAllergens();
  }, [profile, reset]);

  const loadUserAllergens = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Load user allergens
      const allergensRes = await fetch('/api/me/allergens', { headers });
      if (allergensRes.ok) {
        const allergens = await allergensRes.json();
        // Ensure we map the backend IDs to our frontend IDs if they differ, 
        // but assuming they match or we filter valid ones:
        setSelectedAllergens(allergens.map((a: any) => a.id));
      }
    } catch (error) {
      console.error('Error loading allergens:', error);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    setIsSaving(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const userId = session?.user?.id;

      if (!token || !userId) {
        showToast(t('settings.session_error'), 'error');
        return;
      }

      // Check username availability if provided
      if (data.username && data.username.trim()) {
        const { data: isAvailable, error: checkError } = await supabase
          .rpc('is_username_available', { 
            p_username: data.username.trim(),
            p_exclude_user_id: userId 
          });

        if (checkError) {
          showToast(t('settings.check_error'), 'error');
          setIsSaving(false);
          return;
        }

        if (!isAvailable) {
          showToast(t('settings.username_taken'), 'error');
          setIsSaving(false);
          return;
        }
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Update profile
      const profileRes = await fetch('/api/me/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      // Update allergens
      await fetch('/api/me/allergens', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ allergenIds: selectedAllergens }),
      });

      if (profileRes.ok) {
        // Force profile refresh in context to update Navbar immediately
        await refreshProfile();
        
        showToast(t('settings.success'), 'success');
      } else {
        const errorData = await profileRes.json().catch(() => ({}));
        showToast(errorData.message || t('settings.error'), 'error');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast(t('settings.unexpected_error'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAllergen = (allergenId: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergenId)
        ? prev.filter((id) => id !== allergenId)
        : [...prev, allergenId]
    );
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-gradient pt-16 pb-8">
      {/* Header */}
      <header className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 sticky top-16 z-10 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-surface-600 dark:text-surface-300" />
              </Link>
              <h1 className="text-lg sm:text-xl font-heading font-bold text-surface-900 dark:text-white">
                {t('settings.title')}
              </h1>
            </div>
            {/* Logout button removed as requested */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">


        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8" data-testid="settings-form">
          {/* Personal Data */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-base sm:text-lg font-heading font-semibold text-surface-900 dark:text-white">
                {t('settings.personal_data')}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">{t('onboarding.username_label')}</label>
                <div className="flex items-center gap-2">
                  <span className="text-surface-400">@</span>
                  <input
                    {...register('username')}
                    placeholder={t('settings.username_placeholder')}
                    className="input flex-1"
                    data-testid="settings-username"
                  />
                </div>
                <p className="mt-1 text-xs text-surface-500">{t('settings.username_hint')}</p>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">
                    {t(`errors.${errors.username.message}`)}
                  </p>
                )}
              </div>

              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">{t('onboarding.age_label')}</label>
                <input
                  {...register('age', { valueAsNumber: true })}
                  type="number"
                  className="input"
                />
                 {errors.age && (
                  <p className="mt-1 text-sm text-red-600">
                    {t(`errors.${errors.age.message}`)}
                  </p>
                )}
              </div>
              <div>
                <label className="label">{t('onboarding.sex_label')}</label>
                <select {...register('sex')} className="input">
                  <option value={Sex.MALE}>{t('onboarding.sex_male')}</option>
                  <option value={Sex.FEMALE}>{t('onboarding.sex_female')}</option>
                </select>
              </div>
              <div>
                <label className="label">{t('onboarding.weight_label')}</label>
                <input
                  {...register('weightKg', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="input"
                />
                 {errors.weightKg && (
                  <p className="mt-1 text-sm text-red-600">
                    {t(`errors.${errors.weightKg.message}`)}
                  </p>
                )}
              </div>
              <div>
                <label className="label">{t('onboarding.height_label')}</label>
                <input
                  {...register('heightCm', { valueAsNumber: true })}
                  type="number"
                  className="input"
                />
                 {errors.heightCm && (
                  <p className="mt-1 text-sm text-red-600">
                    {t(`errors.${errors.heightCm.message}`)}
                  </p>
                )}
              </div>
              <div>
                <label className="label">{t('onboarding.goal_weight_label')}</label>
                <input
                  {...register('weightGoalKg', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="input"
                />
                 {errors.weightGoalKg && (
                  <p className="mt-1 text-sm text-red-600">
                    {t(`errors.${errors.weightGoalKg.message}`)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

          {/* Activity & Diet */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-accent-600" />
              </div>
              <h2 className="text-base sm:text-lg font-heading font-semibold text-surface-900 dark:text-white">
                {t('settings.activity_diet')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">{t('onboarding.activity_label')}</label>
                <select {...register('activityLevel')} className="input">
                  <option value={ActivityLevel.SEDENTARY}>{t('onboarding.activity_sedentary')}</option>
                  <option value={ActivityLevel.LIGHTLY_ACTIVE}>{t('onboarding.activity_light')}</option>
                  <option value={ActivityLevel.MODERATELY_ACTIVE}>{t('onboarding.activity_moderate')}</option>
                  <option value={ActivityLevel.VERY_ACTIVE}>{t('onboarding.activity_very')}</option>
                  <option value={ActivityLevel.EXTREMELY_ACTIVE}>{t('onboarding.activity_extreme')}</option>
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
              <div className="md:col-span-2">
                <label className="label">{t('onboarding.diet_label')}</label>
                <select {...register('dietPattern')} className="input" data-testid="settings-diet-pattern">
                  <option value={DietPattern.OMNIVORE}>{t('onboarding.diet_omnivore')}</option>
                  <option value={DietPattern.VEGETARIAN}>{t('onboarding.diet_vegetarian')}</option>
                  <option value={DietPattern.VEGAN}>{t('onboarding.diet_vegan')}</option>
                  <option value={DietPattern.PESCATARIAN}>{t('onboarding.diet_pescatarian')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Allergens */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertIcon className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-heading font-semibold text-surface-900 dark:text-white">
                {t('settings.allergens_title')}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2" data-testid="ergens-list">
              {availableAllergens.map((allergen) => {
                const isSelected = selectedAllergens.includes(allergen.id);
                return (
                  <button
                    key={allergen.id}
                    type="button"
                    onClick={() => toggleAllergen(allergen.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isSelected
                        ? 'bg-amber-500 text-white'
                        : 'bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600'
                    }`}
                    data-testid={`allergen-${allergen.id}`}
                  >
                    {t('allergen.' + allergen.id)}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 border-t border-surface-100 dark:border-surface-800 pt-6">
              <label className="label mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary-500" />
                {t('settings.conditions_label')}
              </label>
              <textarea
                {...register('healthConditions')}
                className="input min-h-[100px] text-sm"
                placeholder={t('settings.conditions_placeholder')}
              />
              <p className="mt-2 text-xs text-surface-500 italic">
                {t('settings.conditions_hint')}
              </p>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary w-full flex items-center justify-center gap-2"
            data-testid="save-settings-button"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                {t('settings.save')}
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
