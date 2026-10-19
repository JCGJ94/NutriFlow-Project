import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fetchFullPlan } from '@/lib/plans/fetch-full-plan';
import { DashboardClient, type ActivePlan, type PlanSummary, type TrainingPlan } from './dashboard-client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Read straight from Supabase: an HTTP hop to our own API would need the token forwarded.
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect('/login');

  const { data: rows, error } = await sb
    .from('plans')
    .select('id, week_start, target_kcal, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) console.error('Dashboard: failed to load plans:', error);

  const plans: PlanSummary[] = (rows ?? []).map((p) => ({
    id: p.id,
    weekStart: p.week_start,
    targetKcal: p.target_kcal,
    status: p.status,
    createdAt: p.created_at,
  }));

  const active = plans.find((p) => p.status === 'active');
  let activePlan: ActivePlan | null = null;
  let training: TrainingPlan | null = null;

  if (active) {
    activePlan = (await fetchFullPlan(sb, active.id, user.id)) as ActivePlan | null;
    const { data: ex } = await sb
      .from('exercise_plans')
      .select('plan_data')
      .eq('diet_plan_id', active.id)
      .eq('user_id', user.id)
      .maybeSingle();
    training = (ex?.plan_data as TrainingPlan | undefined) ?? null;
  }

  return <DashboardClient initialPlans={plans} activePlan={activePlan} training={training} />;
}
