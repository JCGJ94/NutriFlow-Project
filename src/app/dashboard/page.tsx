import { apiClient } from '@/lib/apiClient';
import { DashboardClient, type ActivePlan, type PlanSummary, type TrainingPlan } from './dashboard-client';

export const dynamic = 'force-dynamic';

async function load<T>(endpoint: string): Promise<T | null> {
  try {
    return await apiClient.get<T>(endpoint);
  } catch (error) {
    console.error(`Dashboard: failed to fetch ${endpoint}:`, error);
    return null;
  }
}

export default async function DashboardPage() {
  const plans = (await load<PlanSummary[]>('/plans')) ?? [];
  const active = plans.find((p) => p.status === 'active');

  // The day-by-day view needs the full plan and its training; both are optional.
  const [activePlan, training] = active
    ? await Promise.all([
        load<ActivePlan>(`/plans/${active.id}`),
        load<TrainingPlan>(`/exercise-plans/${active.id}`),
      ])
    : [null, null];

  return <DashboardClient initialPlans={plans} activePlan={activePlan} training={training} />;
}
