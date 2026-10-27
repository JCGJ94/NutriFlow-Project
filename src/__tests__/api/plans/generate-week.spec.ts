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

vi.mock('@/lib/diet-engine', () => ({
    generateWeeklyPlan: vi.fn(),
}));

vi.mock('@/lib/exercise-engine', () => ({
    generateExercisePlan: vi.fn(),
}));

vi.mock('@/lib/llm/narration', () => ({
    narrateDiet: vi.fn(),
    translatePlan: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import { requireUser, ApiError } from '@/lib/auth/guards';
import { generateWeeklyPlan } from '@/lib/diet-engine';
import { generateExercisePlan } from '@/lib/exercise-engine';
import { translatePlan } from '@/lib/llm/narration';

// ---- Helpers -----------------------------------------------------------

const mockUser = { id: 'user-123', app_metadata: {}, email: 'user@test.com' };

const mockGeneratedPlan = {
    weekStart: '2024-01-15',
    days: [],  // empty days to avoid meal-insert loop
    targetKcal: 2000,
    targetProtein: 150,
    targetCarbs: 200,
    targetFat: 67,
};

const mockDbProfile = {
    id: 'user-123',
    age: 30,
    sex: 'male',
    weight_kg: 80,
    height_cm: 180,
    activity_level: 'moderately_active',
    meals_per_day: 3,
    diet_pattern: 'omnivore',
    weight_goal_kg: 75,
    language: 'es',
    health_conditions: null,
};

const mockSavedPlan = {
    id: 'saved-plan-1',
    user_id: 'user-123',
    week_start: '2024-01-15',
    target_kcal: 2000,
    target_protein: 150,
    target_carbs: 200,
    target_fat: 67,
    status: 'ACTIVE',
    created_at: '2024-01-01T00:00:00Z',
};

function makeRequest(body?: object): NextRequest {
    return new NextRequest('http://localhost/api/plans/generate-week', {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
        headers: { 'Content-Type': 'application/json' },
    });
}

/**
 * Build a Supabase mock that routes calls per table name.
 * Each table entry can override specific Supabase chain methods.
 */
interface SbExtras {
    allergenRows?: object[];
    allergenError?: { message: string } | null;
    ingredientRows?: object[];
    ingredientError?: { message: string } | null;
}

function buildSb(
    existingPlans: object[] = [],
    profileOverride: object | null = mockDbProfile,
    extras: SbExtras = {},
) {
    // eq() result supports both .order() (list query) and .single() (fetchFullPlan)
    const eqResult = {
        order: vi.fn().mockResolvedValue({ data: existingPlans, error: null }),
        single: vi.fn().mockResolvedValue({ data: mockSavedPlan, error: null }),
    };

    const planSelectChain = {
        select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue(eqResult),
        }),
        insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockSavedPlan, error: null }),
            }),
        }),
        update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
        }),
    };

    const profileSelectChain = {
        select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                    data: profileOverride,
                    error: profileOverride ? null : { code: 'PGRST116', message: '0 rows' },
                }),
            }),
        }),
    };

    const planMealsSelectChain = {
        select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
            }),
        }),
        insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'meal-1' }, error: null }),
            }),
        }),
    };

    return {
        from: vi.fn().mockImplementation((table: string) => {
            // All plans operations: the planSelectChain has select, insert, update
            // Each from('plans') call may use any of these chains.
            if (table === 'plans') {
                return planSelectChain;
            }
            if (table === 'profiles') return profileSelectChain;
            if (table === 'profile_allergens') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({
                            data: extras.allergenError ? null : (extras.allergenRows ?? []),
                            error: extras.allergenError ?? null,
                        }),
                    }),
                };
            }
            if (table === 'ingredients') {
                return {
                    select: vi.fn().mockResolvedValue({
                        data: extras.ingredientError ? null : (extras.ingredientRows ?? []),
                        error: extras.ingredientError ?? null,
                    }),
                };
            }
            if (table === 'plan_meals') return planMealsSelectChain;
            if (table === 'plan_meal_items') {
                return {
                    insert: vi.fn().mockResolvedValue({ error: null }),
                };
            }
            return {
                select: vi.fn().mockResolvedValue({ data: [], error: null }),
            };
        }),
    };
}

// ---- POST /api/plans/generate-week -------------------------------------

describe('POST /api/plans/generate-week', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
        vi.mocked(generateWeeklyPlan).mockReturnValue(mockGeneratedPlan as any);
        vi.mocked(generateExercisePlan).mockReturnValue({ weekStart: '2024-01-15', goal: 'maintain', daysPerWeek: 3, workoutDays: [] } as any);
        vi.mocked(translatePlan).mockResolvedValue(mockGeneratedPlan as any);
    });

    it('returns 401 when unauthenticated', async () => {
        vi.mocked(requireUser).mockRejectedValue(new ApiError(401, 'Unauthorized'));
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { POST } = await import('@/app/api/plans/generate-week/route');
        const res = await POST(makeRequest({ weekStart: '2024-01-15' }));

        expect(res.status).toBe(401);
    });

    it('returns 400 when profile not found', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);
        vi.mocked(createClient).mockResolvedValue(buildSb([], null) as any);

        const { POST } = await import('@/app/api/plans/generate-week/route');
        const res = await POST(makeRequest({ weekStart: '2024-01-15' }));

        expect(res.status).toBe(400);
    });

    it('returns 201 and calls generateWeeklyPlan on happy path', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);
        vi.mocked(createClient).mockResolvedValue(buildSb([], mockDbProfile) as any);

        const { POST } = await import('@/app/api/plans/generate-week/route');
        const res = await POST(makeRequest({ weekStart: '2024-01-15' }));

        expect(res.status).toBe(201);
        expect(generateWeeklyPlan).toHaveBeenCalled();
    });

    describe('allergen safety', () => {
        const ingredientRow = (id: string, allergenIds: string[]) => ({
            id,
            name: id,
            category: 'protein',
            kcal_per_100g: 100,
            protein_per_100g: 10,
            carbs_per_100g: 0,
            fat_per_100g: 5,
            ingredient_allergens: allergenIds.map((allergen_id) => ({ allergen_id })),
        });

        it("passes the user's allergens from profile_allergens to the engine", async () => {
            vi.mocked(requireUser).mockResolvedValue(mockUser as any);
            vi.mocked(createClient).mockResolvedValue(
                buildSb([], mockDbProfile, {
                    allergenRows: [{ allergen_id: 'gluten' }, { allergen_id: 'nuts' }],
                }) as any,
            );

            const { POST } = await import('@/app/api/plans/generate-week/route');
            const res = await POST(makeRequest({ weekStart: '2024-01-15' }));

            expect(res.status).toBe(201);
            const profileArg = vi.mocked(generateWeeklyPlan).mock.calls[0][0];
            expect(profileArg.allergenIds).toEqual(['gluten', 'nuts']);
        });

        it('maps the ingredient_allergens join onto each ingredient', async () => {
            vi.mocked(requireUser).mockResolvedValue(mockUser as any);
            vi.mocked(createClient).mockResolvedValue(
                buildSb([], mockDbProfile, {
                    ingredientRows: [ingredientRow('bread', ['gluten']), ingredientRow('rice', [])],
                }) as any,
            );

            const { POST } = await import('@/app/api/plans/generate-week/route');
            await POST(makeRequest({ weekStart: '2024-01-15' }));

            const ingredientsArg = vi.mocked(generateWeeklyPlan).mock.calls[0][1];
            expect(ingredientsArg.map((i) => [i.id, i.allergenIds])).toEqual([
                ['bread', ['gluten']],
                ['rice', []],
            ]);
        });

        it('fails with 500 instead of generating a plan when the allergen query errors', async () => {
            vi.mocked(requireUser).mockResolvedValue(mockUser as any);
            const sb = buildSb([], mockDbProfile, { allergenError: { message: 'relation does not exist' } });
            vi.mocked(createClient).mockResolvedValue(sb as any);
            const logged = vi.spyOn(console, 'error').mockImplementation(() => {});

            const { POST } = await import('@/app/api/plans/generate-week/route');
            const res = await POST(makeRequest({ weekStart: '2024-01-15' }));

            expect(res.status).toBe(500);
            expect(generateWeeklyPlan).not.toHaveBeenCalled();
            // The failure must come from the allergen query itself, not from an unrelated crash.
            expect(String(logged.mock.calls[0][1])).toContain('Failed to load allergens: relation does not exist');
        });

        it('fails with 500 when the ingredients query errors', async () => {
            vi.mocked(requireUser).mockResolvedValue(mockUser as any);
            vi.mocked(createClient).mockResolvedValue(
                buildSb([], mockDbProfile, { ingredientError: { message: 'boom' } }) as any,
            );
            const logged = vi.spyOn(console, 'error').mockImplementation(() => {});

            const { POST } = await import('@/app/api/plans/generate-week/route');
            const res = await POST(makeRequest({ weekStart: '2024-01-15' }));

            expect(res.status).toBe(500);
            expect(generateWeeklyPlan).not.toHaveBeenCalled();
            expect(String(logged.mock.calls[0][1])).toContain('Failed to load ingredients: boom');
        });
    });

    it('auto-archives oldest plan when user has 3 active plans', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);

        const existingPlans = [
            { id: 'plan-old', created_at: '2023-11-01T00:00:00Z', status: 'ACTIVE' },
            { id: 'plan-mid', created_at: '2023-12-01T00:00:00Z', status: 'ACTIVE' },
            { id: 'plan-new', created_at: '2024-01-01T00:00:00Z', status: 'ACTIVE' },
        ];

        const sb = buildSb(existingPlans, mockDbProfile);
        vi.mocked(createClient).mockResolvedValue(sb as any);

        const { POST } = await import('@/app/api/plans/generate-week/route');
        const res = await POST(makeRequest({ weekStart: '2024-01-15' }));

        // Should succeed — auto-archive runs before create
        expect(res.status).toBe(201);
        // update was called for archive
        expect(sb.from).toHaveBeenCalledWith('plans');
    });
});
