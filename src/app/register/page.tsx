'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';

const registerSchema = z.object({
  email: z.string().email('email_invalid'),
  password: z
    .string()
    .min(8, 'pwd_min')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'pwd_special'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'pwd_match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useLanguage();
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
            t('reg.error_rate_limit'), 
            'warning',
            8000
          );
          return;
        }
        
        // User already exists
        if (authError.message.toLowerCase().includes('already registered') || 
            authError.message.toLowerCase().includes('user already exists')) {
          showToast(t('reg.error_exists'), 'info');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }
        
        // Generic error
        showToast(t('reg.error_signup') + ': ' + authError.message, 'error');
        return;
      }

      // Registration successful - always redirect to login
      if (authData?.user) {
        // Force sign out to ensure user logs in manually
        await supabase.auth.signOut();

        // Check if email confirmation is required
        if (!authData.session) {
          // Email confirmation required
          showToast(
            t('reg.success_confirm'), 
            'success',
            6000
          );
        } else {
          // Auto-login enabled (but we signed out manually)
          showToast(
            t('reg.success_direct'), 
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
          t('reg.error_rate_limit'), 
          'warning',
          8000
        );
      } else {
        showToast(err.message || t('common.error'), 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-gradient flex items-center justify-center px-4 py-12 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8 flex justify-center">
          <Link href="/">
            <Logo size={48} variant="full" />
          </Link>
        </div>

        {/* Card */}
        <div className="card animate-scale-in">
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-surface-900 dark:text-white text-center mb-2">
            {t('reg.title')}
          </h1>
          <p className="text-sm sm:text-base text-surface-600 dark:text-surface-300 text-center mb-6 sm:mb-8">
            {t('reg.subtitle')}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="label">
                {t('auth.login_input_placeholder').split(' o ')[0].split(' or ')[0] || 'Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 pointer-events-none" />
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  placeholder="email@example.com"
                  className="input-icon"
                  autoComplete="email"
                  data-testid="register-email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{t(`errors.${errors.email.message}`)}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">
                {t('auth.password_label')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 pointer-events-none" />
                <input
                  {...register('password')}
                  type="password"
                  id="password"
                  placeholder={t('reg.password_placeholder')}
                  className="input-icon"
                  autoComplete="new-password"
                  data-testid="register-password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{t(`errors.${errors.password.message}`)}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="label">
                {t('reg.confirm_password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 pointer-events-none" />
                <input
                  {...register('confirmPassword')}
                  type="password"
                  id="confirmPassword"
                  placeholder={t('reg.confirm_placeholder')}
                  className="input-icon"
                  autoComplete="new-password"
                  data-testid="register-confirm-password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{t(`errors.${errors.confirmPassword.message}`)}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
              data-testid="register-submit"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {t('reg.submit')}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="mt-6 text-center text-surface-500 dark:text-surface-400 text-sm">
            {t('reg.terms')}
          </p>

          {/* Login Link */}
          <p className="mt-4 text-center text-surface-600 dark:text-surface-300">
            {t('reg.have_account')}{' '}
            <Link href="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              {t('reg.login_link')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

