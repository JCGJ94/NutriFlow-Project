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
  AlertTriangle,
} from 'lucide-react';
import { Sex, ActivityLevel, DietPattern } from '@nutriflow/shared';
import { createClient } from '@/lib/supabase/client';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Escribe tu nombre'),
  age: z.number().min(18, 'Debes tener al menos 18 años').max(100),
  sex: z.nativeEnum(Sex),
  weightKg: z.number().min(30).max(300),
  heightCm: z.number().min(100).max(250),
  activityLevel: z.nativeEnum(ActivityLevel),
  mealsPerDay: z.number().min(2).max(6),
  dietPattern: z.nativeEnum(DietPattern),
  weightGoalKg: z.number().min(30).max(300).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const STEPS = [
  { id: 'basics', title: 'Datos básicos', icon: User },
  { id: 'activity', title: 'Actividad', icon: Activity },
  { id: 'goals', title: 'Objetivos', icon: Target },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [defaultUsername, setDefaultUsername] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      mealsPerDay: 3,
      dietPattern: DietPattern.OMNIVORE,
      activityLevel: ActivityLevel.MODERATELY_ACTIVE,
    },
  });

  const currentWeight = watch('weightKg');

  // Generate default username from email
  useEffect(() => {
    async function generateUsername() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.email) {
          // Extract username from email (part before @)
          const emailPrefix = user.email.split('@')[0];
          // Clean and format: remove special chars, lowercase
          const cleanUsername = emailPrefix
            .replace(/[^a-zA-Z0-9]/g, '_')
            .toLowerCase()
            .substring(0, 20); // Limit length
          
          // Add random suffix to ensure uniqueness
          const randomSuffix = Math.floor(Math.random() * 1000);
          const username = `${cleanUsername}${randomSuffix}`;
          
          setDefaultUsername(username);
        }
      } catch (error) {
        console.error('Error generating username:', error);
        setDefaultUsername(`user${Math.floor(Math.random() * 10000)}`);
      }
    }

    generateUsername();
  }, []);

  const nextStep = async () => {
    // Validate current step fields
    const fieldsToValidate: (keyof ProfileFormData)[][] = [
      ['fullName', 'age', 'sex', 'weightKg', 'heightCm'],
      ['activityLevel', 'mealsPerDay'],
      ['dietPattern', 'weightGoalKg'],
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

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/me/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          username: defaultUsername, // Include generated username
        }),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        console.error('Failed to save profile:', response.status);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
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
            Configura tu perfil
          </h1>
          <p className="text-sm sm:text-base text-surface-600 dark:text-surface-300">
            Necesitamos algunos datos para crear tu plan personalizado
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Basics */}
            {currentStep === 0 && (
              <>
                <div className="mb-4">
                  <label className="label">Nombre completo</label>
                  <input
                    {...register('fullName')}
                    type="text"
                    className="input"
                    placeholder="Tu nombre y apellidos"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Edad</label>
                    <input
                      {...register('age', { valueAsNumber: true })}
                      type="number"
                      className="input"
                      placeholder="30"
                    />
                    {errors.age && (
                      <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="label">Sexo biológico</label>
                    <select {...register('sex')} className="input">
                      <option value={Sex.MALE}>Masculino</option>
                      <option value={Sex.FEMALE}>Femenino</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Peso actual (kg)</label>
                    <input
                      {...register('weightKg', { valueAsNumber: true })}
                      type="number"
                      step="0.1"
                      className="input"
                      placeholder="75"
                    />
                    {errors.weightKg && (
                      <p className="mt-1 text-sm text-red-600">{errors.weightKg.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="label">Altura (cm)</label>
                    <input
                      {...register('heightCm', { valueAsNumber: true })}
                      type="number"
                      className="input"
                      placeholder="175"
                    />
                    {errors.heightCm && (
                      <p className="mt-1 text-sm text-red-600">{errors.heightCm.message}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Activity */}
            {currentStep === 1 && (
              <>
                <div>
                  <label className="label">Nivel de actividad física</label>
                  <select {...register('activityLevel')} className="input">
                    <option value={ActivityLevel.SEDENTARY}>
                      Sedentario (poco o nada de ejercicio)
                    </option>
                    <option value={ActivityLevel.LIGHTLY_ACTIVE}>
                      Ligeramente activo (1-3 días/semana)
                    </option>
                    <option value={ActivityLevel.MODERATELY_ACTIVE}>
                      Moderadamente activo (3-5 días/semana)
                    </option>
                    <option value={ActivityLevel.VERY_ACTIVE}>
                      Muy activo (6-7 días/semana)
                    </option>
                    <option value={ActivityLevel.EXTREMELY_ACTIVE}>
                      Extremadamente activo (ejercicio intenso diario)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="label">Comidas por día</label>
                  <select {...register('mealsPerDay', { valueAsNumber: true })} className="input">
                    <option value={3}>3 comidas (desayuno, almuerzo, cena)</option>
                    <option value={4}>4 comidas (+ 1 snack)</option>
                    <option value={5}>5 comidas (+ 2 snacks)</option>
                  </select>
                </div>
              </>
            )}

            {/* Step 3: Goals */}
            {currentStep === 2 && (
              <>
                <div>
                  <label className="label">Patrón de dieta</label>
                  <select {...register('dietPattern')} className="input">
                    <option value={DietPattern.OMNIVORE}>Omnívoro (como de todo)</option>
                    <option value={DietPattern.VEGETARIAN}>Vegetariano</option>
                    <option value={DietPattern.VEGAN}>Vegano</option>
                    <option value={DietPattern.PESCATARIAN}>Pescatariano</option>
                  </select>
                </div>
                <div>
                  <label className="label">Peso objetivo (kg)</label>
                  <input
                    {...register('weightGoalKg', { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    className="input"
                    placeholder={currentWeight ? String(currentWeight - 5) : '70'}
                  />
                  <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
                    Peso actual: {currentWeight || '--'} kg
                  </p>
                </div>

                {/* Disclaimer */}
                <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Las recomendaciones de NutriFlow son orientativas y no sustituyen 
                    el consejo de un profesional de la salud. Consulta con tu médico 
                    antes de iniciar cualquier plan dietético.
                  </p>
                </div>
              </>
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
                  Anterior
                </button>
              ) : (
                <div />
              )}

              {currentStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary flex items-center gap-2"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Crear mi plan
                      <ArrowRight className="w-4 h-4" />
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
