'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Calendar,
  ShoppingCart,
  ChevronRight,
  Loader2,
  Archive,
  Trash2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

import { useLanguage } from '@/context/LanguageContext';

interface PlanSummary {
  id: string;
  weekStart: string;
  targetKcal: number;
  status: string;
  createdAt: string;
}

export default function PlansPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useLanguage();
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

      // Fetch plans
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
      showToast(t('plans.load_error'), 'error');
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
        showToast(t('dash.no_session'), 'error');
        return;
      }

      const response = await fetch('/api/plans/generate-week', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ useAi: false }),
      });

      if (response.ok) {
        const text = await response.text();
        if (text) {
          const plan = JSON.parse(text);
          showToast(t('plans.gen_success'), 'success');
          router.push(`/plan/${plan.id}`);
        }
      } else {
        // Try to parse error message
        const errorText = await response.text();
        let errorMessage = t('plans.gen_error');
        try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorMessage;
             // Handle "bad request" array of messages (class-validator)
            if (Array.isArray(errorMessage)) {
                errorMessage = errorMessage.join(', ');
            }
        } catch (e) {
            console.warn('Could not parse error response JSON', e);
        }
        showToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      showToast(t('common.error'), 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const deletePlan = async (planId: string) => {
    if (!confirm(t('plans.delete_confirm'))) return;
    
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
            showToast(t('plans.del_success'), 'success');
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

  const activePlans = plans.filter(p => p.status === 'active');
  const archivedPlans = plans.filter(p => p.status !== 'active');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-gradient pt-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-surface-900 dark:text-white mb-2">
              {t('plans.title')}
            </h1>
            <p className="text-surface-600 dark:text-surface-300">
              {t('plans.subtitle')}
            </p>
          </div>
          
          <button
            onClick={generateNewPlan}
            disabled={isGenerating}
            className="btn-primary inline-flex items-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            {t('plans.generate')}
          </button>
        </div>

        {/* Active Plans */}
        <section className="mb-12">
          <h2 className="text-xl font-heading font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            {t('plans.active_title')}
          </h2>

          {activePlans.length === 0 ? (
            <div className="card text-center py-12 border-dashed">
              <p className="text-surface-500 dark:text-surface-400 mb-4">
                {t('plans.no_active')}
              </p>
              <button
                onClick={generateNewPlan}
                disabled={isGenerating}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {t('plans.generate_now')} &rarr;
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activePlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => router.push(`/plan/${plan.id}`)}
                  className="card hover:border-primary-300 transition-all duration-200 group cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                      <Calendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex gap-2">
                         <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                           {t('plans.status_active')}
                         </span>
                         <button
                            onClick={(e) => {
                                e.stopPropagation();
                                deletePlan(plan.id);
                            }}
                            disabled={isDeleting === plan.id}
                            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-500 transition-colors"
                         >
                            {isDeleting === plan.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                         </button>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-lg text-surface-900 dark:text-white mb-1">
                    {t('plans.week_of')} {formatDate(plan.weekStart)}
                  </h3>
                  <p className="text-surface-500 dark:text-surface-400 text-sm mb-4">
                    {plan.targetKcal} {t('plans.kcal_day')}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-surface-100 dark:border-surface-800">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                       <Link
                        href={`/shopping-list/${plan.id}`}
                        className="text-sm font-medium text-surface-600 hover:text-primary-600 flex items-center gap-1 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {t('dash.shopping_list')}
                       </Link>
                    </div>
                    <ChevronRight className="w-5 h-5 text-surface-400 group-hover:text-primary-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Archived Plans */}
        {archivedPlans.length > 0 && (
          <section>
            <h2 className="text-xl font-heading font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <Archive className="w-5 h-5 text-surface-500" />
              {t('plans.history_title')}
            </h2>
            <div className="space-y-3">
              {archivedPlans.map((plan) => (
                 <div
                  key={plan.id}
                  onClick={() => router.push(`/plan/${plan.id}`)}
                  className="card flex items-center gap-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer py-3"
                >
                  <div className="p-2 bg-surface-100 dark:bg-surface-800 rounded-lg text-surface-500">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-surface-700 dark:text-surface-200">
                      {t('plans.week_of')} {formatDate(plan.weekStart)}
                    </h3>
                  </div>
                  <div className="text-sm text-surface-500 dark:text-surface-400 mr-2">
                    {plan.targetKcal} kcal
                  </div>
                   <button
                        onClick={(e) => {
                            e.stopPropagation();
                            deletePlan(plan.id);
                        }}
                        disabled={isDeleting === plan.id}
                        className="p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-500 transition-colors"
                    >
                        {isDeleting === plan.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                    </button>
                  <ChevronRight className="w-4 h-4 text-surface-400" />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
