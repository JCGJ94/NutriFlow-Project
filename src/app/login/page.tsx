'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { AuthShell } from '@/components/AuthShell';
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
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
      {/* Card */}
      <div className="card">
        <h1 className="text-3xl font-heading mb-2">
          {t('auth.login_title')}
        </h1>
        <p className="text-base text-muted mb-6 sm:mb-8">
          {t('auth.login_subtitle')}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
          {/* Email or Username */}
          <div>
            <label htmlFor="emailOrUsername" className="label">
              {t('auth.login_input_label')}
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
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
              <p className="mt-1 text-sm text-red-500">{t(`errors.${errors.emailOrUsername.message}`)}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="label">
              {t('auth.password_label')}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
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
              <p className="mt-1 text-sm text-red-500">{t(`errors.${errors.password.message}`)}</p>
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
        <p className="mt-6 text-center text-muted">
          {t('auth.no_account')}{' '}
          <Link href="/register" className="text-signal-text font-medium hover:underline">
            {t('auth.register_link')}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
