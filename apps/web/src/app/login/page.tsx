'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';

const loginSchema = z.object({
  emailOrUsername: z.string().min(3, 'login_input'),
  password: z.string().min(6, 'login_pwd_min'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useLanguage();
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
          showToast(t('auth.error_user_not_found'), 'error');
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
        showToast(t('auth.error_invalid'), 'error');
        return;
      }

      showToast(t('common.success'), 'success');
      
      // Check if user has a profile to decide where to redirect
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        
        if (!profile) {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      showToast(t('common.error'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-gradient flex items-center justify-center px-4 py-8 sm:py-12 transition-colors duration-300">
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
            {t('auth.login_title')}
          </h1>
          <p className="text-sm sm:text-base text-surface-600 dark:text-surface-300 text-center mb-6 sm:mb-8">
            {t('auth.login_subtitle')}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
            {/* Email or Username */}
            <div>
              <label htmlFor="emailOrUsername" className="label">
                {t('auth.login_input_label')}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  {...register('emailOrUsername')}
                  type="text"
                  id="emailOrUsername"
                  placeholder={t('auth.login_input_placeholder')}
                  className="input-icon"
                  autoComplete="username"
                  data-testid="login-email"
                />
              </div>
              {errors.emailOrUsername && (
                <p className="mt-1 text-sm text-red-600">{t(`errors.${errors.emailOrUsername.message}`)}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">
                {t('auth.password_label')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  {...register('password')}
                  type="password"
                  id="password"
                  placeholder={t('auth.password_placeholder')}
                  className="input-icon"
                  autoComplete="current-password"
                  data-testid="login-password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{t(`errors.${errors.password.message}`)}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
              data-testid="login-submit"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {t('auth.login_submit')}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-surface-600 dark:text-surface-300">
            {t('auth.no_account')}{' '}
            <Link href="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              {t('auth.register_link')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

