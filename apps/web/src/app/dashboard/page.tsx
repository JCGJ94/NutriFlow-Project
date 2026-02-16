import { apiClient } from '@/lib/apiClient';
import { DashboardClient } from './dashboard-client';

export const dynamic = 'force-dynamic';

// Define PlanSummary locally or import. 
// Ideally shared, but re-defining to avoid internal package dependency issues for now depending on monorepo setup.
interface PlanSummary {
  id: string;
  weekStart: string;
  targetKcal: number;
  status: string;
  createdAt: string;
}

export default async function DashboardPage() {
  // Parallel data fetching could happen here if we had more endpoints
  // For now, just plans. User profile is handled by Context/Layout usually, 
  // but if we need it here we can fetch it.
  
  let plans: PlanSummary[] = [];

  try {
     plans = await apiClient.get<PlanSummary[]>('/plans');
  } catch (error) {
     console.error('Failed to fetch plans for dashboard:', error);
     // We can allow the page to render with empty plans, 
     // the client component handles empty state.
  }

  return <DashboardClient initialPlans={plans} />;
}
