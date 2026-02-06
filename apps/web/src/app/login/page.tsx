'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Utensils, User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/context/ToastContext';

const loginSchema = z.object({
  emailOrUsername: z.string().min(3, 'Ingresa tu email o nombre de usuario'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const supabase = createClient();
      let email = data.emailOrUsername;

      // If input doesn't contain @, treat it as username and lookup email
      if (!data.emailOrUsername.includes('@')) {
        const { data: emailResult, error: lookupError } = await supabase
          .rpc('get_email_by_username', { p_username: data.emailOrUsername });

        if (lookupError || !emailResult) {
          showToast('Usuario no encontrado. Verifica tu nombre de usuario.', 'error');
          setIsLoading(false);
          return;
        }
        email = emailResult;
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: data.password,
      });

      if (authError) {
        showToast('Credenciales incorrectas. Revisa tu email/usuario y contraseña.', 'error');
        return;
      }

      showToast('¡Hola de nuevo! Iniciando sesión...', 'success');
      router.push('/dashboard');
    } catch (err) {
      showToast('Error inesperado al iniciar sesión.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-gradient flex items-center justify-center px-4 py-8 sm:py-12 transition-colors duration-300">
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
            Bienvenido de nuevo
          </h1>
          <p className="text-sm sm:text-base text-surface-600 dark:text-surface-300 text-center mb-6 sm:mb-8">
            Inicia sesión para acceder a tu plan
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
            {/* Email or Username */}
            <div>
              <label htmlFor="emailOrUsername" className="label">
                Email o nombre de usuario
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  {...register('emailOrUsername')}
                  type="text"
                  id="emailOrUsername"
                  placeholder="tu@email.com o @username"
                  className="input-icon"
                />
              </div>
              {errors.emailOrUsername && (
                <p className="mt-1 text-sm text-red-600">{errors.emailOrUsername.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  {...register('password')}
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  className="input-icon"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
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
                  Iniciar sesión
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-surface-600 dark:text-surface-300">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

