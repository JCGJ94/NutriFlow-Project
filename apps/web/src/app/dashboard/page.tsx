'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  ShoppingCart,
  ChevronRight,
  Loader2,
  Settings,
  Sparkles,
  Trash2,
  Target,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { SmartRecommendations } from '@/components/dashboard/SmartRecommendations';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';

interface PlanSummary {
  id: string;
  weekStart: string;
  targetKcal: number;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      console.log('Verifying profile exists...');
      const profileResponse = await fetch('/api/me/profile', { headers });
      
      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error('Failed to fetch profile:', profileResponse.status, errorText);
        showToast(t('dash.profile_error'), 'error');
        return;
      }

      const profileData = await profileResponse.json().catch(() => null);
      
      if (!profileData || !profileData.id) {
        console.log('Profile missing or incomplete, redirecting to onboarding...');
        showToast(t('dash.welcome_new'), 'info');
        router.push('/onboarding');
        return;
      }

      console.log('Profile verified successfully.');

      const response = await fetch('/api/plans', { headers });
      if (response.ok) {
        const text = await response.text();
        if (text) {
          const data = JSON.parse(text);
          setPlans(data);
        }
      } else {
        console.error('Failed to fetch plans:', response.status);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showToast(t('common.error'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewPlan = async () => {
    setIsGenerating(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        showToast(t('auth.error_invalid'), 'error');
        return;
      }

      const response = await fetch('/api/plans/generate-week', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ useAi: true }),
      });

      if (response.ok) {
        const text = await response.text();
        if (text) {
          const plan = JSON.parse(text);
          showToast(t('dash.gen_success'), 'success');
          router.push(`/plan/${plan.id}`);
        }
      } else {
        showToast(t('dash.gen_error'), 'error');
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      showToast(t('common.error'), 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const deletePlan = async (planId: string) => {
    if (!confirm(t('dash.delete_confirm'))) return;
    
    setIsDeleting(planId);
    try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) return;

        const response = await fetch(`/api/plans/${planId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            setPlans(plans.filter(p => p.id !== planId));
            showToast(t('dash.delete_success'), 'success');
        } else {
            showToast(t('dash.delete_error'), 'error');
        }
    } catch (error) {
        console.error('Error deleting plan:', error);
        showToast(t('common.error'), 'error');
    } finally {
        setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-gradient pt-16">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-surface-900 dark:text-white mb-2">
            {t('dash.welcome')}
          </h1>
          <p className="text-sm sm:text-base text-surface-600 dark:text-surface-300">
            {t('dash.subtitle')}
          </p>
        </div>
        <SmartRecommendations />
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <button
            onClick={generateNewPlan}
            disabled={isGenerating}
            className="group relative overflow-hidden rounded-2xl border border-primary-100 dark:border-primary-900 bg-white dark:bg-surface-800 p-5 sm:p-6 transition-all hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 text-left min-h-[120px] sm:min-h-auto"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles className="w-32 h-32 text-primary-600 dark:text-primary-400 rotate-12" />
            </div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
                {isGenerating ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Sparkles className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-heading font-semibold text-surface-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {t('dash.generate_plan')}
                </h3>
                <p className="text-surface-600 dark:text-surface-300 text-sm">
                  {t('dash.generate_subtitle')}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-surface-400 group-hover:text-primary-600 transition-colors" />
            </div>
          </button>

          <Link
            href="/settings"
            className="group relative overflow-hidden rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-5 sm:p-6 transition-all hover:shadow-lg hover:border-surface-300 dark:hover:border-surface-600 text-left min-h-[120px] sm:min-h-auto"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Settings className="w-32 h-32 text-surface-600 dark:text-surface-400 rotate-12" />
            </div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-surface-500 to-surface-700 flex items-center justify-center text-white shadow-lg shadow-surface-500/20 group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-heading font-semibold text-surface-900 dark:text-white mb-1 group-hover:text-surface-700 dark:group-hover:text-surface-200 transition-colors">
                  {t('dash.configure_profile')}
                </h3>
                <p className="text-surface-600 dark:text-surface-300 text-sm">
                  {t('dash.configure_subtitle')}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-surface-400 group-hover:text-surface-600 transition-colors" />
            </div>
          </Link>
        </div>

        {/* Active Plan or CTA */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-semibold text-surface-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              {t('dash.active_plan')}
            </h2>
            <Link 
              href="/plans"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
            >
              {t('dash.view_history')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {!plans.find(p => p.status === 'active') ? (
            <div className="card text-center py-12 border-dashed border-2 border-surface-200 dark:border-surface-700 bg-transparent shadow-none">
              <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-surface-400" />
              </div>
              <h3 className="text-lg font-medium text-surface-700 dark:text-surface-200 mb-2">
                {t('dash.no_active_plan')}
              </h3>
              <p className="text-surface-500 dark:text-surface-400 mb-6 max-w-sm mx-auto">
                {t('dash.no_plan_subtitle')}
              </p>
              <button
                onClick={generateNewPlan}
                disabled={isGenerating}
                className="btn-primary inline-flex items-center gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {t('dash.generate_plan')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
               {plans.filter(p => p.status === 'active').map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => router.push(`/plan/${plan.id}`)}
                  className="group relative overflow-hidden rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-6 md:p-8 transition-all hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-800 cursor-pointer"
                >
                  {/* Subtle Background Decoration */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 dark:bg-primary-900/10 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 pointer-events-none"></div>

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-6">
                           {/* Date Box */}
                          <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-surface-50 dark:bg-surface-700 border border-surface-100 dark:border-surface-600 shadow-sm text-surface-900 dark:text-white">
                             <span className="text-[10px] font-bold uppercase tracking-wider text-surface-500">
                               {t('dash.week')}
                             </span>
                             <span className="text-2xl font-bold font-heading">{new Date(plan.weekStart).getDate()}</span>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-heading font-bold text-xl md:text-2xl text-surface-900 dark:text-white">
                                    {t('dash.smart_plan_title')}
                                </h3>
                                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                      {t('dash.in_progress')}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-surface-500 dark:text-surface-400">
                                <span className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-primary-500" />
                                    <span className="font-medium text-surface-700 dark:text-surface-300">{plan.targetKcal} kcal</span> {t('dash.daily')}
                                </span>
                                <span className="hidden sm:inline w-1 h-1 rounded-full bg-surface-300 dark:bg-surface-600"></span>
                                <span>
                                  {t('dash.created')} {new Date(plan.createdAt).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                          </div>
                      </div>

                      <div className="flex items-center gap-3 mt-2 md:mt-0 pl-22 md:pl-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/shopping-list/${plan.id}`);
                            }}
                            className="relative overflow-hidden inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-200 font-medium shadow-sm hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all group/btn"
                        >
                            <span className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20 opacity-0 group-hover/btn:opacity-100 transition-opacity"></span>
                            <ShoppingCart className="w-4 h-4" />
                            <span>{t('dash.shopping_list')}</span>
                        </button>
                        
                         <button
                            onClick={(e) => {
                                e.stopPropagation();
                                deletePlan(plan.id);
                            }}
                            disabled={isDeleting === plan.id}
                            className="p-2.5 rounded-xl text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                            title={t('common.delete')}
                        >
                            {isDeleting === plan.id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Trash2 className="w-5 h-5" />
                            )}
                        </button>
                        
                        <div className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full border border-transparent group-hover:border-surface-200 dark:group-hover:border-surface-700 text-surface-300 group-hover:text-primary-600 transition-all">
                            <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
