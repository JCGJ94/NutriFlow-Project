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

const profileSchema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres').max(20, 'Máximo 20 caracteres').regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos').optional(),

  age: z.number().min(18).max(100),
  sex: z.nativeEnum(Sex),
  weightKg: z.number().min(30).max(300),
  heightCm: z.number().min(100).max(250),
  activityLevel: z.nativeEnum(ActivityLevel),
  mealsPerDay: z.number().min(2).max(6),
  dietPattern: z.nativeEnum(DietPattern),
  weightGoalKg: z.number().min(30).max(300).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function SettingsPage() {

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

  useEffect(() => {
    if (profile) {
      reset({
        username: profile.username || '',
        age: profile.age,
        sex: profile.sex as Sex, // Casting safe because API returns enum string
        weightKg: profile.weight_kg,
        heightCm: profile.height_cm,
        activityLevel: profile.activity_level as ActivityLevel,
        mealsPerDay: profile.meals_per_day,
        dietPattern: profile.diet_pattern as DietPattern,
        weightGoalKg: profile.weight_goal_kg,
      });
      setIsLoading(false);
    }
    loadAdditionalData();
  }, [profile, reset]);

  const loadAdditionalData = async () => {



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
        setSelectedAllergens(allergens.map((a: any) => a.id));
      }

      // Load available allergens (Public or protected endpoint)
      const allAllergensRes = await fetch('/api/allergens', { headers });
      const translationMap: Record<string, string> = {
        'gluten': 'Gluten',
        'dairy': 'Lácteos',
        'nuts': 'Frutos secos',
        'shellfish': 'Mariscos',
        'eggs': 'Huevos',
        'soy': 'Soja',
        'peanuts': 'Cacahuetes',
        'fish': 'Pescado',
        'mustard': 'Mostaza',
        'sesame': 'Sésamo',
        'celery': 'Apio',
        'lupin': 'Altramuces',
        'molluscs': 'Moluscos',
        'sulfites': 'Sulfitos'
      };

      if (allAllergensRes.ok) {
        const all = await allAllergensRes.json();
        const translatedAll = all.map((a: any) => ({
          ...a,
          name: translationMap[a.id] || a.name
        }));
        setAvailableAllergens(translatedAll);
      } else {
        // Fallback if API hasn't been deployed with the new endpoint yet
        console.warn('API /api/allergens not found, using fallback.');
        setAvailableAllergens([
            { id: 'gluten', name: 'Gluten' },
            { id: 'dairy', name: 'Lácteos' },
            { id: 'nuts', name: 'Frutos secos' },
            { id: 'shellfish', name: 'Mariscos' },
            { id: 'eggs', name: 'Huevos' },
            { id: 'soy', name: 'Soja' },
            { id: 'peanuts', name: 'Cacahuetes' },
            { id: 'fish', name: 'Pescado' }
        ]);
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
        showToast('Sesión no válida. Por favor, inicia sesión de nuevo.', 'error');
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
          showToast('Error al verificar disponibilidad del nombre de usuario.', 'error');
          setIsSaving(false);
          return;
        }

        if (!isAvailable) {
          showToast('Este nombre de usuario ya está en uso. Elige otro.', 'error');
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
        
        showToast('¡Perfil actualizado correctamente!', 'success');
      } else {
        const errorData = await profileRes.json().catch(() => ({}));
        showToast(errorData.message || 'Error al guardar el perfil.', 'error');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast('Error inesperado al guardar el perfil.', 'error');
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
                Configuración
              </h1>
            </div>
            {/* Logout button removed as requested */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">


        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
          {/* Personal Data */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-base sm:text-lg font-heading font-semibold text-surface-900 dark:text-white">
                Datos personales
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Nombre de usuario</label>
                <div className="flex items-center gap-2">
                  <span className="text-surface-400">@</span>
                  <input
                    {...register('username')}
                    placeholder="tu_usuario"
                    className="input flex-1"
                  />
                </div>
                <p className="mt-1 text-xs text-surface-500">Este nombre aparecerá en la barra de navegación</p>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Edad</label>
                <input
                  {...register('age', { valueAsNumber: true })}
                  type="number"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Sexo biológico</label>
                <select {...register('sex')} className="input">
                  <option value={Sex.MALE}>Masculino</option>
                  <option value={Sex.FEMALE}>Femenino</option>
                </select>
              </div>
              <div>
                <label className="label">Peso actual (kg)</label>
                <input
                  {...register('weightKg', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Altura (cm)</label>
                <input
                  {...register('heightCm', { valueAsNumber: true })}
                  type="number"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Peso objetivo (kg)</label>
                <input
                  {...register('weightGoalKg', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="input"
                />
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
                Actividad y dieta
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nivel de actividad</label>
                <select {...register('activityLevel')} className="input">
                  <option value={ActivityLevel.SEDENTARY}>Sedentario</option>
                  <option value={ActivityLevel.LIGHTLY_ACTIVE}>Ligeramente activo</option>
                  <option value={ActivityLevel.MODERATELY_ACTIVE}>Moderadamente activo</option>
                  <option value={ActivityLevel.VERY_ACTIVE}>Muy activo</option>
                  <option value={ActivityLevel.EXTREMELY_ACTIVE}>Extremadamente activo</option>
                </select>
              </div>
              <div>
                <label className="label">Comidas por día</label>
                <select {...register('mealsPerDay', { valueAsNumber: true })} className="input">
                  <option value={3}>3 comidas</option>
                  <option value={4}>4 comidas</option>
                  <option value={5}>5 comidas</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="label">Patrón de dieta</label>
                <select {...register('dietPattern')} className="input">
                  <option value={DietPattern.OMNIVORE}>Omnívoro</option>
                  <option value={DietPattern.VEGETARIAN}>Vegetariano</option>
                  <option value={DietPattern.VEGAN}>Vegano</option>
                  <option value={DietPattern.PESCATARIAN}>Pescatariano</option>
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
                Alergias e intolerancias
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
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
                  >
                    {allergen.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Guardar cambios
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
