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
const mockParams = { params: Promise.resolve({ id: 'plan-abc' }) };

function makeRequest(body?: object): NextRequest {
    return new NextRequest('http://localhost/api/plans/plan-abc/lock-meal', {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
        headers: { 'Content-Type': 'application/json' },
    });
}

function makeSbWithPlanAndLock(planOwnerId: string) {
    return {
        from: vi.fn().mockImplementation((table: string) => {
            if (table === 'plans') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: { id: 'plan-abc', user_id: planOwnerId, week_start: '2024-01-15', target_kcal: 2000, target_protein: 150, target_carbs: 200, target_fat: 67, status: 'ACTIVE', created_at: '2024-01-01T00:00:00Z' },
                                error: null,
                            }),
                        }),
                    }),
                };
            }
            if (table === 'plan_meals') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            order: vi.fn().mockReturnValue({
                                order: vi.fn().mockResolvedValue({ data: [], error: null }),
                            }),
                        }),
                    }),
                    update: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({ error: null }),
                    }),
                };
            }
            return {};
        }),
    };
}

// ---- POST /api/plans/[id]/lock-meal ------------------------------------

describe('POST /api/plans/[id]/lock-meal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it('returns 200 when meal is locked successfully', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);
        vi.mocked(createClient).mockResolvedValue(makeSbWithPlanAndLock('user-123') as any);

        const { POST } = await import('@/app/api/plans/[id]/lock-meal/route');
        const res = await POST(makeRequest({ mealId: 'meal-1', isLocked: true }), mockParams);

        expect(res.status).toBe(200);
    });

    it('returns 200 when meal is unlocked successfully', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);
        vi.mocked(createClient).mockResolvedValue(makeSbWithPlanAndLock('user-123') as any);

        const { POST } = await import('@/app/api/plans/[id]/lock-meal/route');
        const res = await POST(makeRequest({ mealId: 'meal-1', isLocked: false }), mockParams);

        expect(res.status).toBe(200);
    });

    it('returns 404 when plan belongs to another user', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);
        vi.mocked(createClient).mockResolvedValue(makeSbWithPlanAndLock('other-user') as any);

        const { POST } = await import('@/app/api/plans/[id]/lock-meal/route');
        const res = await POST(makeRequest({ mealId: 'meal-1', isLocked: true }), mockParams);

        expect(res.status).toBe(404);
    });

    it('returns 400 when body is missing mealId', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);
        vi.mocked(createClient).mockResolvedValue(makeSbWithPlanAndLock('user-123') as any);

        const { POST } = await import('@/app/api/plans/[id]/lock-meal/route');
        const res = await POST(makeRequest({ isLocked: true }), mockParams);

        expect(res.status).toBe(400);
    });

    it('returns 401 when unauthenticated', async () => {
        vi.mocked(requireUser).mockRejectedValue(new ApiError(401, 'Unauthorized'));
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { POST } = await import('@/app/api/plans/[id]/lock-meal/route');
        const res = await POST(makeRequest({ mealId: 'meal-1', isLocked: true }), mockParams);

        expect(res.status).toBe(401);
    });
});
