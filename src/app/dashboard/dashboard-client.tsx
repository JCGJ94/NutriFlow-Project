'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Dumbbell, Loader2, Settings, ShoppingCart, Sparkles, Trash2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import { useUser } from '@/context/UserContext';
import { useConfirmation } from '@/context/ConfirmationContext';
import { usePlans } from '@/context/PlansContext';
import { apiClient } from '@/lib/apiClient';
import { getMealTypeName } from '@/lib/utils';
import { dayIndexInPlan } from '@/lib/dashboard/today';

export interface PlanSummary {
  id: string;
  weekStart: string;
  targetKcal: number;
  status: string;
  createdAt: string;
}

interface DayMeal {
  id: string;
  mealType: string;
  totalKcal: number;
  items: { id: string; ingredientName: string; grams: number }[];
}

export interface ActivePlan extends PlanSummary {
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  days: {
    dayOfWeek: number;
    meals: DayMeal[];
    totalKcal: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
  }[];
}

export interface TrainingPlan {
  workoutDays: {
    dayOfWeek: number;
    name: string;
    isRestDay?: boolean;
    totalDurationMin: number;
    exercises: { exerciseName: string; sets: number; reps?: number; durationSec?: number }[];
  }[];
}

interface DashboardClientProps {
  initialPlans: PlanSummary[];
  activePlan: ActivePlan | null;
  training: TrainingPlan | null;
}

const MEAL_ORDER = ['breakfast', 'lunch', 'snack', 'dinner'];

function MacroBar({ label, value, target }: { label: string; value: number; target: number }) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="text-ink">
          {Math.round(value)} <span className="text-muted">/ {Math.round(target)} g</span>
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper-3">
        <div className="h-full rounded-full bg-signal" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function DashboardClient({ initialPlans, activePlan, training }: DashboardClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const { user, profile, isLoading: isUserLoading } = useUser();
  const { refreshPlans } = usePlans();
  const { confirm } = useConfirmation();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const locale = language === 'es' ? 'es-ES' : 'en-US';
  const todayIndex = useMemo(
    () => (activePlan ? dayIndexInPlan(activePlan.weekStart, new Date()) : null),
    [activePlan],
  );
  const [selected, setSelected] = useState<number>(todayIndex ?? 0);

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
      const plan = await apiClient.post<{ id?: string }>('/plans/generate-week', { useAi: true });
      if (plan && plan.id) {
        showToast(t('dash.gen_success'), 'success');
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

  const deletePlan = async (planId: string) => {
    const isConfirmed = await confirm({
      title: t('common.delete') || 'Eliminar Plan',
      description: t('dash.delete_confirm'),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      variant: 'danger',
    });
    if (!isConfirmed) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(`/plans/${planId}`);
      await refreshPlans();
      router.refresh();
      showToast(t('dash.delete_success'), 'success');
    } catch (error) {
      console.error('Error deleting plan:', error);
      showToast(t('dash.delete_error'), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper-2">
        <Loader2 className="h-8 w-8 animate-spin text-signal-text" />
      </div>
    );
  }

  const summary = initialPlans.find((p) => p.status === 'active');
  const dateOf = (dayIndex: number) => {
    const [y, m, d] = (activePlan ?? summary)!.weekStart.split('-').map(Number);
    return new Date(y, m - 1, d + dayIndex);
  };

  const day = activePlan?.days.find((d) => d.dayOfWeek === selected);
  const meals = [...(day?.meals ?? [])].sort(
    (a, b) => MEAL_ORDER.indexOf(a.mealType) - MEAL_ORDER.indexOf(b.mealType),
  );
  const workout = training?.workoutDays.find((w) => w.dayOfWeek === selected);
  const heading = new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen bg-page-gradient pt-16" data-testid="dashboard-content">
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.1em] text-muted">{heading}</p>
            <h1 className="type-display-sm mt-1">{t('dash.today')}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              data-testid="quick-action-profile"
              className="btn-secondary inline-flex items-center gap-2"
              aria-label={t('dash.configure_profile')}
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t('dash.configure_profile')}</span>
            </Link>
            <button
              onClick={generateNewPlan}
              disabled={isGenerating}
              data-testid="quick-action-generate"
              className="btn-primary inline-flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              )}
              {t('dash.generate_plan')}
            </button>
          </div>
        </header>

        {!summary || !activePlan ? (
          <section className="mt-10 rounded-3xl border border-dashed border-rule px-6 py-16 text-center">
            <h2 className="text-2xl text-ink">{t('dash.no_active_plan')}</h2>
            <p className="mx-auto mt-2 max-w-sm text-muted">{t('dash.no_plan_subtitle')}</p>
            <button
              onClick={generateNewPlan}
              disabled={isGenerating}
              data-testid="generate-plan-cta"
              className="btn-primary mt-7 inline-flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              )}
              {t('dash.generate_plan')}
            </button>
          </section>
        ) : (
          <>
            <nav aria-label={t('dash.plan_week_of')} className="mt-8 grid grid-cols-7 gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                const date = dateOf(i);
                const on = i === selected;
                return (
                  <button
                    key={i}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSelected(i)}
                    className={`flex flex-col items-center rounded-2xl border px-1 py-3 transition-colors ${
                      on
                        ? 'border-signal bg-signal text-signal-ink'
                        : 'border-rule bg-paper-2 text-ink hover:border-ink'
                    }`}
                  >
                    <span className="text-xs uppercase tracking-[0.08em] opacity-80">
                      {date.toLocaleDateString(locale, { weekday: 'short' }).replace('.', '')}
                    </span>
                    <span className="mt-0.5 text-xl">{date.getDate()}</span>
                    <span
                      aria-hidden="true"
                      className={`mt-1 h-1 w-1 rounded-full ${i === todayIndex ? (on ? 'bg-signal-ink' : 'bg-signal') : 'bg-transparent'}`}
                    />
                  </button>
                );
              })}
            </nav>
            {todayIndex === null && (
              <p className="mt-3 text-sm text-muted">{t('dash.outside_week')}</p>
            )}

            <div className="mt-8 grid gap-6 lg:grid-cols-5">
              <section className="rounded-3xl border border-rule bg-paper-2 p-6 sm:p-8 lg:col-span-3">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <h2 className="text-2xl text-ink">{t('dash.todays_meals')}</h2>
                  <p className="text-ink">
                    <span className="text-3xl">{Math.round(day?.totalKcal ?? 0)}</span>{' '}
                    <span className="text-muted">
                      {t('dash.target_of').replace('{{kcal}}', String(Math.round(activePlan.targetKcal)))}
                    </span>
                  </p>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <MacroBar label={t('dash.protein')} value={day?.totalProtein ?? 0} target={activePlan.targetProtein} />
                  <MacroBar label={t('dash.carbs')} value={day?.totalCarbs ?? 0} target={activePlan.targetCarbs} />
                  <MacroBar label={t('dash.fat')} value={day?.totalFat ?? 0} target={activePlan.targetFat} />
                </div>

                {meals.length === 0 ? (
                  <p className="mt-8 text-muted">{t('dash.no_meals_day')}</p>
                ) : (
                  <ul className="mt-8 divide-y divide-rule">
                    {meals.map((meal) => (
                      <li key={meal.id} className="flex items-start justify-between gap-4 py-4">
                        <div className="min-w-0">
                          <p className="text-lg text-ink">{getMealTypeName(meal.mealType, language)}</p>
                          <p className="mt-0.5 text-muted">
                            {meal.items.map((it) => it.ingredientName).join(' · ')}
                          </p>
                        </div>
                        <p className="shrink-0 text-ink">{Math.round(meal.totalKcal)} kcal</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <div className="flex flex-col gap-6 lg:col-span-2">
                <section className="rounded-3xl border border-rule bg-paper-2 p-6 sm:p-8">
                  <h2 className="flex items-center gap-2 text-2xl text-ink">
                    <Dumbbell className="h-5 w-5 text-signal-text" aria-hidden="true" />
                    {t('dash.training')}
                  </h2>
                  {!workout ? (
                    <p className="mt-3 text-muted">{t('dash.no_training')}</p>
                  ) : workout.isRestDay ? (
                    <p className="mt-3 text-lg text-ink">{t('dash.rest_today')}</p>
                  ) : (
                    <>
                      <p className="mt-3 text-lg text-ink">{workout.name}</p>
                      <p className="text-muted">
                        {t('dash.exercises_count')
                          .replace('{{count}}', String(workout.exercises.length))
                          .replace('{{min}}', String(workout.totalDurationMin))}
                      </p>
                      <ul className="mt-4 space-y-1.5 text-ink">
                        {workout.exercises.slice(0, 4).map((e, i) => (
                          <li key={i} className="flex justify-between gap-3">
                            <span className="truncate">{e.exerciseName}</span>
                            <span className="shrink-0 text-muted">
                              {e.sets} × {e.reps ?? `${e.durationSec ?? 0}s`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </section>

                <Link
                  href={`/shopping-list/${summary.id}`}
                  className="group flex items-center justify-between gap-4 rounded-3xl border border-rule bg-paper-2 p-6 transition-colors hover:border-signal sm:p-8"
                >
                  <div>
                    <p className="flex items-center gap-2 text-2xl text-ink">
                      <ShoppingCart className="h-5 w-5 text-signal-text" aria-hidden="true" />
                      {t('dash.shopping_list')}
                    </p>
                    <p className="mt-1 text-muted">{t('dash.shopping_hint')}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted transition-colors group-hover:text-signal-text" aria-hidden="true" />
                </Link>

                <div
                  onClick={() => router.push(`/plan/${summary.id}`)}
                  data-testid="active-plan-card"
                  className="flex cursor-pointer items-center justify-between gap-4 rounded-3xl border border-rule bg-paper-2 p-6 transition-colors hover:border-signal sm:p-8"
                >
                  <div className="min-w-0">
                    <p className="text-sm uppercase tracking-[0.1em] text-muted">{t('dash.plan_week_of')}</p>
                    <p className="text-2xl text-ink">
                      {dateOf(0).toLocaleDateString(locale, { day: 'numeric', month: 'long' })}
                    </p>
                    {profile?.weight_kg ? (
                      <p className="mt-1 text-muted">
                        {t('dash.weight_goal')}: {profile.weight_kg} kg
                        {profile.weight_goal_kg ? ` → ${profile.weight_goal_kg} kg` : ''}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePlan(summary.id);
                    }}
                    disabled={isDeleting}
                    title={t('common.delete')}
                    aria-label={t('common.delete')}
                    className="rounded-xl p-2.5 text-muted transition-colors hover:text-red-500"
                  >
                    {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
