import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

const planData = { weekStart: '2026-10-19', goal: 'maintain', daysPerWeek: 3, workoutDays: [] };

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn().mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }) },
        from: () => ({
            select: () => ({
                eq: () => ({
                    eq: () => ({
                        single: vi.fn().mockResolvedValue({
                            data: { id: 'ep-1', user_id: 'user-1', diet_plan_id: 'dp-1', plan_data: planData },
                            error: null,
                        }),
                    }),
                }),
            }),
        }),
    }),
}));

describe('GET /api/exercise-plans/[dietPlanId]', () => {
    it('returns the ExercisePlan stored in plan_data, not the raw row', async () => {
        const { GET } = await import('@/app/api/exercise-plans/[dietPlanId]/route');
        const res = await GET(new NextRequest('http://localhost/api/exercise-plans/dp-1'), {
            params: Promise.resolve({ dietPlanId: 'dp-1' }),
        });
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual(planData);
    });
});
