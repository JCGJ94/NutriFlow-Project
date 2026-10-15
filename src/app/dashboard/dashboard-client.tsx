'use client';

import { useState, useEffect } from 'react';
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
import { SmartRecommendations } from '@/components/dashboard/SmartRecommendations';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import { useUser } from '@/context/UserContext';
import { useConfirmation } from '@/context/ConfirmationContext';
import { usePlans } from '@/context/PlansContext'; // Still used for refresh? Or purely props?
import { apiClient } from '@/lib/apiClient';

// Simplified Plan Interface for Props (match PlanSummary from Context/API)
interface PlanSummary {
  id: string;
  weekStart: string;
  targetKcal: number;
  status: string;
  createdAt: string;
}

interface DashboardClientProps {
  initialPlans: PlanSummary[];
}

export function DashboardClient({ initialPlans }: DashboardClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const { user, profile, isLoading: isUserLoading } = useUser();
  const { refreshPlans } = usePlans(); // Keep using context refresh to sync other parts of app if needed?

  // Use props for rendering, but allow local override if we want optimistic updates?
  // For now, rely on router.refresh()
  const displayPlans = initialPlans;

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    // Only redirect to onboarding if there IS an authenticated user but no profile.
    // Do NOT redirect when user is null (logging out) — that causes a race with handleLogout.
    if (!isUserLoading && user && (!profile || !profile.id)) {
        router.push('/onboarding');
    }
  }, [isUserLoading, user, profile, router]);

  const generateNewPlan = async () => {
    setIsGenerating(true);
    try {
      const plan = await apiClient.post<any>('/plans/generate-week', { useAi: true });
      
      if (plan && plan.id) {
          showToast(t('dash.gen_success'), 'success');
          // Refresh context just in case other components need it
          refreshPlans(); 
          router.push(`/plan/${plan.id}`);
          router.refresh(); 
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      showToast(t('dash.gen_error'), 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const { confirm } = useConfirmation();

  const deletePlan = async (planId: string) => {
    const isConfirmed = await confirm({
        title: t('common.delete') || 'Eliminar Plan',
        description: t('dash.delete_confirm'),
        confirmText: t('common.delete'),
        cancelText: t('common.cancel'),
        variant: 'danger'
    });

    if (!isConfirmed) return;
    
    setIsDeleting(planId);
    try {
        await apiClient.delete(`/plans/${planId}`);
        
        await refreshPlans();
        router.refresh(); // Reload server data
        showToast(t('dash.delete_success'), 'success');
    } catch (error) {
        console.error('Error deleting plan:', error);
        showToast(t('dash.delete_error'), 'error');
    } finally {
        setIsDeleting(null);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-paper-2 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-signal-text animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-gradient pt-16" data-testid="dashboard-content">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-ink mb-2">
            {t('dash.welcome')}
          </h1>
          <p className="text-sm sm:text-base text-muted">
            {t('dash.subtitle')}
          </p>
        </div>
        <SmartRecommendations />
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <button
            onClick={generateNewPlan}
            disabled={isGenerating}
            className="group relative overflow-hidden rounded-2xl border border-rule bg-paper-2 p-5 sm:p-6 transition-all hover:shadow-lg hover:border-signal text-left min-h-[120px] sm:min-h-auto"
            data-testid="quick-action-generate"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles className="w-32 h-32 text-signal-text rotate-12" />
            </div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-signal flex items-center justify-center text-signal-ink group-hover:scale-110 transition-transform">
                {isGenerating ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Sparkles className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-heading font-semibold text-ink mb-1 group-hover:text-signal-text transition-colors">
                  {t('dash.generate_plan')}
                </h3>
                <p className="text-muted text-sm">
                  {t('dash.generate_subtitle')}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted group-hover:text-signal-text transition-colors" />
            </div>
          </button>

          <Link
            href="/settings"
            className="group relative overflow-hidden rounded-2xl border border-rule bg-paper-2 p-5 sm:p-6 transition-all hover:shadow-lg hover:border-rule text-left min-h-[120px] sm:min-h-auto"
            data-testid="quick-action-profile"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Settings className="w-32 h-32 text-muted rotate-12" />
            </div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-paper-3 flex items-center justify-center text-ink group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-heading font-semibold text-ink mb-1 group-hover:text-ink transition-colors">
                  {t('dash.configure_profile')}
                </h3>
                <p className="text-muted text-sm">
                  {t('dash.configure_subtitle')}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted group-hover:text-ink transition-colors" />
            </div>
          </Link>
        </div>

        {/* Active Plan or CTA */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-semibold text-ink flex items-center gap-2">
              <Calendar className="w-5 h-5 text-signal-text" />
              {t('dash.active_plan')}
            </h2>
            <Link 
              href="/plans"
              className="text-sm font-medium text-signal-text hover:text-signal-text flex items-center gap-1"
            >
              {t('dash.view_history')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {!displayPlans.find(p => p.status === 'active') ? (
            <div className="card text-center py-12 border-dashed border-2 border-rule bg-transparent shadow-none">
              <div className="w-16 h-16 rounded-full bg-paper-2 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-muted" />
              </div>
              <h3 className="text-lg font-medium text-ink mb-2">
                {t('dash.no_active_plan')}
              </h3>
              <p className="text-muted mb-6 max-w-sm mx-auto">
                {t('dash.no_plan_subtitle')}
              </p>
              <button
                onClick={generateNewPlan}
                disabled={isGenerating}
                className="btn-primary inline-flex items-center gap-2"
                data-testid="generate-plan-cta"
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
               {displayPlans.filter(p => p.status === 'active').map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => router.push(`/plan/${plan.id}`)}
                  className="group relative overflow-hidden rounded-2xl border border-rule bg-paper-2 p-6 md:p-8 transition-all hover:shadow-xl hover:border-signal cursor-pointer"
                  data-testid="active-plan-card"
                >
                  {/* Subtle Background Decoration */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-paper-3 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 pointer-events-none"></div>

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-6">
                           {/* Date Box */}
                          <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-paper-2 border border-rule shadow-xs text-ink">
                             <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                               {t('dash.week')}
                             </span>
                             <span className="text-2xl font-bold font-heading">{new Date(plan.weekStart).getDate()}</span>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-heading font-bold text-xl md:text-2xl text-ink">
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
                            
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
                                <span className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-signal-text" />
                                    <span className="font-medium text-ink">{plan.targetKcal} kcal</span> {t('dash.daily')}
                                </span>
                                <span className="hidden sm:inline w-1 h-1 rounded-full bg-paper-3"></span>
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
                            className="relative overflow-hidden inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-paper-2 border border-rule text-ink font-medium shadow-xs hover:border-signal hover:text-signal-text transition-all group/btn"
                        >
                            <span className="absolute inset-0 bg-paper-3 opacity-0 group-hover/btn:opacity-100 transition-opacity"></span>
                            <ShoppingCart className="w-4 h-4" />
                            <span>{t('dash.shopping_list')}</span>
                        </button>
                        
                         <button
                            onClick={(e) => {
                                e.stopPropagation();
                                deletePlan(plan.id);
                            }}
                            disabled={isDeleting === plan.id}
                            className="p-2.5 rounded-xl text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                            title={t('common.delete')}
                        >
                            {isDeleting === plan.id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Trash2 className="w-5 h-5" />
                            )}
                        </button>
                        
                        <div className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full border border-transparent group-hover:border-rule text-muted group-hover:text-signal-text transition-all">
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
