'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { Icon3D } from '@/components/dashboard/Icon3D';
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

function useCountUp(target: number) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / 800);
      setValue(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduce]);
  return reduce ? target : value;
}

function Count({ value }: { value: number }) {
  return <>{useCountUp(value)}</>;
}

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
        <motion.div
          key={`${label}-${value}`}
          className="h-full rounded-full bg-signal"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.06 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } }),
};

function Stat({ icon, label, value, hint, i }: { icon: React.ReactNode; label: string; value: React.ReactNode; hint: string; i: number }) {
  return (
    <motion.div
      variants={rise}
      custom={i}
      initial="hidden"
      animate="show"
      whileHover={{ y: -4 }}
      className="flex items-center gap-4 rounded-3xl border border-rule bg-paper-2 p-4 sm:p-5"
    >
      {icon}
      <div className="min-w-0">
        <p className="text-sm uppercase tracking-[0.08em] text-muted">{label}</p>
        <p className="truncate text-2xl text-ink">{value}</p>
        <p className="truncate text-sm text-muted">{hint}</p>
      </div>
    </motion.div>
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
  const name = profile?.username;
  const trainingValue = !workout ? '—' : workout.isRestDay ? t('dash.rest_today') : workout.name;
  const trainingHint = !workout
    ? t('dash.no_training')
    : workout.isRestDay
      ? ' '
      : t('dash.exercises_count')
          .replace('{{count}}', String(workout.exercises.length))
          .replace('{{min}}', String(workout.totalDurationMin));

  return (
    <div className="min-h-screen bg-page-gradient pt-16" data-testid="dashboard-content">
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <motion.header
          variants={rise}
          custom={0}
          initial="hidden"
          animate="show"
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <Icon3D name="sun" size={96} className="[&_img]:size-[72px] sm:[&_img]:size-24" />
            <div>
              <p className="text-sm uppercase tracking-[0.1em] text-muted">{heading}</p>
              <h1 className="type-display-sm mt-1">{t('dash.today')}</h1>
              {name ? <p className="mt-1 text-lg text-muted">{t('dash.hello').replace('{{name}}', name)}</p> : null}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              data-testid="quick-action-profile"
              className="btn-secondary inline-flex items-center gap-2"
              aria-label={t('dash.configure_profile')}
            >
              <Icon3D name="setting" size={28} />
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
        </motion.header>

        {!summary || !activePlan ? (
          <motion.section
            variants={rise}
            custom={2}
            initial="hidden"
            animate="show"
            className="mt-10 flex flex-col items-center rounded-3xl border border-dashed border-rule px-6 py-14 text-center"
          >
            <Icon3D name="rocket" size={140} />
            <h2 className="mt-4 text-2xl text-ink">{t('dash.no_active_plan')}</h2>
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
          </motion.section>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Stat
                i={1}
                icon={<Icon3D name="fire" size={64} delay={0.2} />}
                label={t('dash.stat_calories')}
                value={
                  <>
                    <Count value={Math.round(day?.totalKcal ?? 0)} /> kcal
                  </>
                }
                hint={t('dash.target_of').replace('{{kcal}}', String(Math.round(activePlan.targetKcal)))}
              />
              <Stat
                i={2}
                icon={<Icon3D name="meals" size={64} delay={0.6} />}
                label={t('dash.stat_meals')}
                value={t('dash.meals_count').replace('{{count}}', String(meals.length))}
                hint={meals.map((m) => getMealTypeName(m.mealType, language)).join(' · ') || ' '}
              />
              <Stat
                i={3}
                icon={<Icon3D name="gym" size={64} delay={1} />}
                label={t('dash.stat_training')}
                value={trainingValue}
                hint={trainingHint}
              />
            </div>

            <motion.nav
              variants={rise}
              custom={4}
              initial="hidden"
              animate="show"
              aria-label={t('dash.plan_week_of')}
              className="mt-8 grid grid-cols-7 gap-2"
            >
              {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                const date = dateOf(i);
                const on = i === selected;
                return (
                  <button
                    key={i}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSelected(i)}
                    className={`relative flex flex-col items-center rounded-2xl border px-1 py-3 transition-colors ${
                      on ? 'border-transparent text-signal-ink' : 'border-rule bg-paper-2 text-ink hover:border-ink'
                    }`}
                  >
                    {on && (
                      <motion.span
                        layoutId="day-pill"
                        className="absolute inset-0 rounded-2xl bg-signal"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative text-xs uppercase tracking-[0.08em] opacity-80">
                      {date.toLocaleDateString(locale, { weekday: 'short' }).replace('.', '')}
                    </span>
                    <span className="relative mt-0.5 text-xl">{date.getDate()}</span>
                    <span
                      aria-hidden="true"
                      className={`relative mt-1 h-1 w-1 rounded-full ${i === todayIndex ? (on ? 'bg-signal-ink' : 'bg-signal') : 'bg-transparent'}`}
                    />
                  </button>
                );
              })}
            </motion.nav>
            {todayIndex === null && <p className="mt-3 text-sm text-muted">{t('dash.outside_week')}</p>}

            <div className="mt-8 grid gap-6 lg:grid-cols-5">
              <motion.section
                key={selected}
                variants={rise}
                custom={0}
                initial="hidden"
                animate="show"
                className="rounded-3xl border border-rule bg-paper-2 p-6 sm:p-8 lg:col-span-3"
              >
                <div className="flex items-center gap-4">
                  <Icon3D name="macros" size={56} delay={0.4} />
                  <div>
                    <h2 className="text-2xl text-ink">{t('dash.todays_meals')}</h2>
                    <p className="text-muted">{t('dash.macros')}</p>
                  </div>
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
                    {meals.map((meal, k) => (
                      <motion.li
                        key={meal.id}
                        variants={rise}
                        custom={k + 2}
                        initial="hidden"
                        animate="show"
                        className="flex items-start justify-between gap-4 py-4"
                      >
                        <div className="min-w-0">
                          <p className="text-lg text-ink">{getMealTypeName(meal.mealType, language)}</p>
                          <p className="mt-0.5 text-muted">{meal.items.map((it) => it.ingredientName).join(' · ')}</p>
                        </div>
                        <p className="shrink-0 text-ink">{Math.round(meal.totalKcal)} kcal</p>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </motion.section>

              <div className="flex flex-col gap-6 lg:col-span-2">
                <motion.section
                  key={`w-${selected}`}
                  variants={rise}
                  custom={1}
                  initial="hidden"
                  animate="show"
                  className="rounded-3xl border border-rule bg-paper-2 p-6 sm:p-8"
                >
                  <h2 className="flex items-center gap-3 text-2xl text-ink">
                    <Icon3D name="target" size={44} delay={0.8} />
                    {t('dash.training')}
                  </h2>
                  {!workout ? (
                    <p className="mt-3 text-muted">{t('dash.no_training')}</p>
                  ) : workout.isRestDay ? (
                    <p className="mt-3 text-lg text-ink">{t('dash.rest_today')}</p>
                  ) : (
                    <>
                      <p className="mt-3 text-lg text-ink">{workout.name}</p>
                      <p className="text-muted">{trainingHint}</p>
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
                </motion.section>

                <motion.div variants={rise} custom={2} initial="hidden" animate="show" whileHover={{ y: -4 }}>
                  <Link
                    href={`/shopping-list/${summary.id}`}
                    className="group flex items-center justify-between gap-4 rounded-3xl border border-rule bg-paper-2 p-6 transition-colors hover:border-signal sm:p-8"
                  >
                    <div className="flex items-center gap-4">
                      <Icon3D name="bag" size={56} delay={0.3} />
                      <div>
                        <p className="text-2xl text-ink">{t('dash.shopping_list')}</p>
                        <p className="mt-1 text-muted">{t('dash.shopping_hint')}</p>
                      </div>
                    </div>
                    <ChevronRight
                      className="h-5 w-5 text-muted transition-all group-hover:translate-x-1 group-hover:text-signal-text"
                      aria-hidden="true"
                    />
                  </Link>
                </motion.div>

                <motion.div
                  variants={rise}
                  custom={3}
                  initial="hidden"
                  animate="show"
                  whileHover={{ y: -4 }}
                  onClick={() => router.push(`/plan/${summary.id}`)}
                  data-testid="active-plan-card"
                  className="flex cursor-pointer items-center justify-between gap-4 rounded-3xl border border-rule bg-paper-2 p-6 transition-colors hover:border-signal sm:p-8"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <Icon3D name="calendar" size={56} delay={0.5} />
                    <div className="min-w-0">
                      <p className="text-sm uppercase tracking-[0.1em] text-muted">{t('dash.plan_week_of')}</p>
                      <p className="text-2xl text-ink">
                        {dateOf(0).toLocaleDateString(locale, { day: 'numeric', month: 'long' })}
                      </p>
                      <p className="mt-1 text-muted">
                        {profile?.weight_kg
                          ? `${t('dash.weight_goal')}: ${profile.weight_kg} kg${profile.weight_goal_kg ? ` → ${profile.weight_goal_kg} kg` : ''}`
                          : t('dash.open_plan')}
                      </p>
                    </div>
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
                    className="rounded-xl p-2 transition-transform hover:scale-110"
                  >
                    {isDeleting ? <Loader2 className="h-6 w-6 animate-spin text-muted" /> : <Icon3D name="trash" size={40} />}
                  </button>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
