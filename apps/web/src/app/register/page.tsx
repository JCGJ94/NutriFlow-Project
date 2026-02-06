'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Utensils, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/context/ToastContext';

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Debe incluir al menos un carácter especial'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        // Rate limit detection (429 error)
        if (authError.message.toLowerCase().includes('rate limit') || 
            authError.message.toLowerCase().includes('too many requests') ||
            authError.status === 429) {
          showToast(
            'Se ha excedido el límite de registros. Por favor, espera unos minutos e intenta nuevamente.', 
            'warning',
            8000
          );
          return;
        }
        
        // User already exists
        if (authError.message.toLowerCase().includes('already registered') || 
            authError.message.toLowerCase().includes('user already exists')) {
          showToast('Este email ya está registrado. Te redirigimos al login.', 'info');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }
        
        // Generic error
        showToast(`Error al registrarse: ${authError.message}`, 'error');
        return;
      }

      // Registration successful - always redirect to login
      if (authData?.user) {
        // Check if email confirmation is required
        if (!authData.session) {
          // Email confirmation required
          showToast(
            '¡Cuenta creada! Revisa tu email para verificar tu cuenta antes de iniciar sesión.', 
            'success',
            6000
          );
        } else {
          // Auto-login enabled (no email confirmation required)
          showToast(
            '¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.', 
            'success',
            4000
          );
        }
        
        // Redirect to login after 2 seconds
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (err: any) {
      // Network or unexpected errors
      if (err.message?.toLowerCase().includes('rate limit') || 
          err.message?.toLowerCase().includes('too many requests')) {
        showToast(
          'Se ha excedido el límite de registros. Por favor, espera unos minutos e intenta nuevamente.', 
          'warning',
          8000
        );
      } else {
        showToast(err.message || 'Error inesperado al registrarse.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-gradient flex items-center justify-center px-4 py-12 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Utensils className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600 dark:text-primary-400" />
            <span className="text-xl sm:text-2xl font-heading font-bold text-primary-600 dark:text-primary-400">
              NutriFlow
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="card animate-scale-in">
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-surface-900 dark:text-white text-center mb-2">
            Crea tu cuenta
          </h1>
          <p className="text-sm sm:text-base text-surface-600 dark:text-surface-300 text-center mb-6 sm:mb-8">
            Empieza a generar tu plan nutricional personalizado
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 pointer-events-none" />
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  placeholder="ejemplo@correo.com"
                  className="input-icon"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 pointer-events-none" />
                <input
                  {...register('password')}
                  type="password"
                  id="password"
                  placeholder="Mín. 8 caracteres y un símbolo"
                  className="input-icon"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 pointer-events-none" />
                <input
                  {...register('confirmPassword')}
                  type="password"
                  id="confirmPassword"
                  placeholder="Repite tu contraseña"
                  className="input-icon"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Crear cuenta
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="mt-6 text-center text-surface-500 dark:text-surface-400 text-sm">
            Al registrarte, aceptas que las recomendaciones son orientativas 
            y no sustituyen consejo médico profesional.
          </p>

          {/* Login Link */}
          <p className="mt-4 text-center text-surface-600 dark:text-surface-300">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

