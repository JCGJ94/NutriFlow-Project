import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---- Mocks -------------------------------------------------------------

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(),
}));

vi.mock('@/lib/auth/guards', () => ({
    requireUser: vi.fn(),
    ApiError: class ApiError extends Error {
        status: number;
        constructor(status: number, message: string) {
            super(message);
            this.status = status;
            this.name = 'ApiError';
        }
    },
}));

import { createClient } from '@/lib/supabase/server';
import { requireUser, ApiError } from '@/lib/auth/guards';

// ---- Helpers -----------------------------------------------------------

const mockUser = { id: 'user-123', app_metadata: {}, email: 'user@test.com' };

function makeRequest(method = 'GET', url = 'http://localhost/api/plans/plan-abc'): NextRequest {
    return new NextRequest(url, { method });
}

const mockParams = { params: Promise.resolve({ id: 'plan-abc' }) };

function makeSbWithPlan(plan: object | null, mealsData: object[] = []) {
    return {
        from: vi.fn().mockImplementation((table: string) => {
            if (table === 'plans') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: plan, error: plan ? null : { code: 'PGRST116' } }),
                        }),
                    }),
                    delete: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({ error: null }),
                    }),
                };
            }
            if (table === 'plan_meals') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            order: vi.fn().mockReturnValue({
                                order: vi.fn().mockResolvedValue({ data: mealsData, error: null }),
                            }),
                        }),
                    }),
                };
            }
            return {};
        }),
    };
}

// ---- GET /api/plans/[id] -----------------------------------------------

describe('GET /api/plans/[id]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it('returns 200 with plan when user owns it', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);
        const plan = { id: 'plan-abc', user_id: 'user-123', week_start: '2024-01-15', target_kcal: 2000, target_protein: 150, target_carbs: 200, target_fat: 67, status: 'ACTIVE', created_at: '2024-01-01T00:00:00Z' };
        vi.mocked(createClient).mockResolvedValue(makeSbWithPlan(plan) as any);

        const { GET } = await import('@/app/api/plans/[id]/route');
        const res = await GET(makeRequest(), mockParams);

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.id).toBe('plan-abc');
    });

    it('returns 404 when plan belongs to another user', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);
        const plan = { id: 'plan-abc', user_id: 'other-user', week_start: '2024-01-15', target_kcal: 2000, target_protein: 150, target_carbs: 200, target_fat: 67, status: 'ACTIVE', created_at: '2024-01-01T00:00:00Z' };
        vi.mocked(createClient).mockResolvedValue(makeSbWithPlan(plan) as any);

        const { GET } = await import('@/app/api/plans/[id]/route');
        const res = await GET(makeRequest(), mockParams);

        expect(res.status).toBe(404);
    });

    it('returns 404 when plan does not exist', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);
        vi.mocked(createClient).mockResolvedValue(makeSbWithPlan(null) as any);

        const { GET } = await import('@/app/api/plans/[id]/route');
        const res = await GET(makeRequest(), mockParams);

        expect(res.status).toBe(404);
    });

    it('returns 401 when unauthenticated', async () => {
        vi.mocked(requireUser).mockRejectedValue(new ApiError(401, 'Unauthorized'));
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { GET } = await import('@/app/api/plans/[id]/route');
        const res = await GET(makeRequest(), mockParams);

        expect(res.status).toBe(401);
    });
});

// ---- DELETE /api/plans/[id] --------------------------------------------

describe('DELETE /api/plans/[id]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it('returns 204 when plan is deleted successfully', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);
        const plan = { id: 'plan-abc', user_id: 'user-123', week_start: '2024-01-15', target_kcal: 2000, target_protein: 150, target_carbs: 200, target_fat: 67, status: 'ACTIVE', created_at: '2024-01-01T00:00:00Z' };
        vi.mocked(createClient).mockResolvedValue(makeSbWithPlan(plan) as any);

        const { DELETE } = await import('@/app/api/plans/[id]/route');
        const res = await DELETE(makeRequest('DELETE'), mockParams);

        expect(res.status).toBe(204);
    });

    it('returns 404 when deleting plan owned by another user', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);
        const plan = { id: 'plan-abc', user_id: 'other-user', week_start: '2024-01-15', target_kcal: 2000, target_protein: 150, target_carbs: 200, target_fat: 67, status: 'ACTIVE', created_at: '2024-01-01T00:00:00Z' };
        vi.mocked(createClient).mockResolvedValue(makeSbWithPlan(plan) as any);

        const { DELETE } = await import('@/app/api/plans/[id]/route');
        const res = await DELETE(makeRequest('DELETE'), mockParams);

        expect(res.status).toBe(404);
    });

    it('returns 401 when unauthenticated on delete', async () => {
        vi.mocked(requireUser).mockRejectedValue(new ApiError(401, 'Unauthorized'));
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { DELETE } = await import('@/app/api/plans/[id]/route');
        const res = await DELETE(makeRequest('DELETE'), mockParams);

        expect(res.status).toBe(401);
    });
});
