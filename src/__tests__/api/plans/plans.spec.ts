import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---- Mock modules before any imports -----------------------------------

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

function makeRequest(method = 'GET', body?: object, url = 'http://localhost/api/plans'): NextRequest {
    return new NextRequest(url, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: body ? { 'Content-Type': 'application/json' } : {},
    });
}

function makeSbWithPlans(plans: object[]) {
    return {
        from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({ data: plans, error: null }),
                }),
            }),
        }),
    };
}

// ---- GET /api/plans ----------------------------------------------------

describe('GET /api/plans', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it('returns 200 with list of plans for authenticated user', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);

        const plans = [
            { id: 'plan-1', week_start: '2024-01-15', target_kcal: 2000, status: 'ACTIVE', created_at: '2024-01-01T00:00:00Z' },
            { id: 'plan-2', week_start: '2024-01-08', target_kcal: 1900, status: 'ACTIVE', created_at: '2023-12-25T00:00:00Z' },
        ];

        vi.mocked(createClient).mockResolvedValue(makeSbWithPlans(plans) as any);

        const { GET } = await import('@/app/api/plans/route');
        const res = await GET(makeRequest());

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body).toHaveLength(2);
        expect(body[0].id).toBe('plan-1');
    });

    it('returns 200 with empty array when user has no plans', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);
        vi.mocked(createClient).mockResolvedValue(makeSbWithPlans([]) as any);

        const { GET } = await import('@/app/api/plans/route');
        const res = await GET(makeRequest());

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toEqual([]);
    });

    it('returns 401 when unauthenticated', async () => {
        vi.mocked(requireUser).mockRejectedValue(new ApiError(401, 'Unauthorized'));
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { GET } = await import('@/app/api/plans/route');
        const res = await GET(makeRequest());

        expect(res.status).toBe(401);
    });
});
