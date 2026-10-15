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

vi.mock('@/lib/exercise-engine', () => ({
    generateExercisePlan: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import { requireUser, ApiError } from '@/lib/auth/guards';
import { generateExercisePlan } from '@/lib/exercise-engine';

// ---- Helpers -----------------------------------------------------------

const mockUser = { id: 'user-123', app_metadata: {}, email: 'user@test.com' };

const mockExercisePlan = {
    weekStart: '2024-01-15',
    goal: 'maintain',
    daysPerWeek: 3,
    workoutDays: [],
};

function makeRequest(method = 'GET', body?: object, url = 'http://localhost/api/exercise-plans'): NextRequest {
    return new NextRequest(url, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: body ? { 'Content-Type': 'application/json' } : {},
    });
}

function makeSbWithProfile(profile: object | null) {
    return {
        from: vi.fn().mockImplementation((table: string) => {
            if (table === 'profiles') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: profile, error: profile ? null : { code: 'PGRST116' } }),
                        }),
                    }),
                };
            }
            if (table === 'user_allergens') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
                    }),
                };
            }
            // exercise_plans table
            return {
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockResolvedValue({ data: [], error: null }),
                    }),
                }),
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: { id: 'ep-1', user_id: 'user-123', diet_plan_id: null, plan_data: mockExercisePlan, created_at: '2024-01-01T00:00:00Z' }, error: null }),
                    }),
                }),
            };
        }),
    };
}

const mockDbProfile = {
    id: 'user-123',
    age: 30,
    sex: 'MALE',
    weight_kg: 80,
    height_cm: 180,
    activity_level: 'MODERATELY_ACTIVE',
    meals_per_day: 3,
    diet_pattern: 'OMNIVORE',
    weight_goal_kg: 75,
    language: 'es',
    health_conditions: null,
};

// ---- GET /api/exercise-plans -------------------------------------------

describe('GET /api/exercise-plans', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it('returns 200 with list of exercise plans', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);
        vi.mocked(createClient).mockResolvedValue(makeSbWithProfile(mockDbProfile) as any);

        const { GET } = await import('@/app/api/exercise-plans/route');
        const res = await GET(makeRequest());

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(Array.isArray(body)).toBe(true);
    });

    it('returns 401 when unauthenticated', async () => {
        vi.mocked(requireUser).mockRejectedValue(new ApiError(401, 'Unauthorized'));
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { GET } = await import('@/app/api/exercise-plans/route');
        const res = await GET(makeRequest());

        expect(res.status).toBe(401);
    });
});

// ---- POST /api/exercise-plans (generate) -------------------------------

describe('POST /api/exercise-plans', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
        vi.mocked(generateExercisePlan).mockReturnValue(mockExercisePlan as any);
    });

    it('returns 201 with generated exercise plan', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);
        vi.mocked(createClient).mockResolvedValue(makeSbWithProfile(mockDbProfile) as any);

        const { POST } = await import('@/app/api/exercise-plans/route');
        const res = await POST(makeRequest('POST', { dietPlanId: 'plan-abc' }));

        expect(res.status).toBe(201);
        expect(generateExercisePlan).toHaveBeenCalled();
    });

    it('returns 400 when profile not found', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);
        vi.mocked(createClient).mockResolvedValue(makeSbWithProfile(null) as any);

        const { POST } = await import('@/app/api/exercise-plans/route');
        const res = await POST(makeRequest('POST', { dietPlanId: 'plan-abc' }));

        expect(res.status).toBe(400);
    });

    it('returns 401 when unauthenticated', async () => {
        vi.mocked(requireUser).mockRejectedValue(new ApiError(401, 'Unauthorized'));
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { POST } = await import('@/app/api/exercise-plans/route');
        const res = await POST(makeRequest('POST', { dietPlanId: 'plan-abc' }));

        expect(res.status).toBe(401);
    });
});
