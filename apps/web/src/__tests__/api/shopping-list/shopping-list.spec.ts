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
const planId = 'plan-abc';

function makeRequest(
    method = 'GET',
    body?: object,
    url = `http://localhost/api/shopping-list/${planId}`,
): NextRequest {
    return new NextRequest(url, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: body ? { 'Content-Type': 'application/json' } : {},
    });
}

// ---- GET /api/shopping-list/[planId] -----------------------------------

describe('GET /api/shopping-list/[planId]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it('returns 200 with shopping list items for authenticated owner', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);

        const existingList = {
            id: 'list-1',
            plan_id: planId,
            generated_at: '2024-01-01T00:00:00Z',
            plans: { week_start: '2024-01-15', user_id: 'user-123' },
            items: [
                {
                    id: 'item-1',
                    custom_name: null,
                    ingredient_id: 'ing-1',
                    total_grams: 200,
                    is_checked: false,
                    ingredients: { id: 'ing-1', name: 'Chicken', name_en: 'Chicken', category: 'PROTEIN' },
                },
            ],
        };

        const sb = {
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        maybeSingle: vi.fn().mockResolvedValue({ data: existingList, error: null }),
                        // For ownership check on plans table
                        single: vi.fn().mockResolvedValue({ data: { id: planId, user_id: 'user-123' }, error: null }),
                    }),
                }),
            }),
        };
        vi.mocked(createClient).mockResolvedValue(sb as any);

        const { GET } = await import('@/app/api/shopping-list/[planId]/route');
        const res = await GET(makeRequest(), { params: Promise.resolve({ planId }) });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toHaveProperty('planId', planId);
        expect(Array.isArray(body.items)).toBe(true);
    });

    it('returns 404 when plan does not exist or does not belong to user', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);

        const sb = {
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'not found' } }),
                        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                    }),
                }),
            }),
        };
        vi.mocked(createClient).mockResolvedValue(sb as any);

        const { GET } = await import('@/app/api/shopping-list/[planId]/route');
        const res = await GET(makeRequest(), { params: Promise.resolve({ planId }) });

        expect(res.status).toBe(404);
    });

    it('returns 401 when unauthenticated', async () => {
        vi.mocked(requireUser).mockRejectedValue(new ApiError(401, 'Unauthorized'));
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { GET } = await import('@/app/api/shopping-list/[planId]/route');
        const res = await GET(makeRequest(), { params: Promise.resolve({ planId }) });

        expect(res.status).toBe(401);
    });
});

// ---- POST /api/shopping-list/[planId]/items/toggle --------------------

describe('POST /api/shopping-list/[planId]/items/toggle', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it('toggles item checked state and returns new state', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);

        // Mock: plan ownership check, find shopping list, find items, update item
        const planRow = { id: planId, user_id: 'user-123' };
        const shoppingListRow = { id: 'list-1', plan_id: planId };
        // Item with ingredientName matching via custom_name (isCustom item)
        const itemRows = [
            {
                id: 'item-1',
                is_checked: false,
                custom_name: 'Chicken breast',
                ingredient_id: null,
                ingredients: null,
            },
        ];
        const updatedRow = { id: 'item-1', is_checked: true };

        const fromMock = vi.fn().mockImplementation((table: string) => {
            if (table === 'plans') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: planRow, error: null }),
                        }),
                    }),
                };
            }
            if (table === 'shopping_lists') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: shoppingListRow, error: null }),
                        }),
                    }),
                };
            }
            if (table === 'shopping_list_items') {
                return {
                    // For SELECT query (find items by shopping_list_id)
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({ data: itemRows, error: null }),
                    }),
                    // For UPDATE query
                    update: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            select: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({ data: updatedRow, error: null }),
                            }),
                        }),
                    }),
                };
            }
            return { select: vi.fn() };
        });

        vi.mocked(createClient).mockResolvedValue({ from: fromMock } as any);

        const { POST } = await import('@/app/api/shopping-list/[planId]/items/toggle/route');
        const res = await POST(
            makeRequest('POST', { ingredientName: 'Chicken breast' }, `http://localhost/api/shopping-list/${planId}/items/toggle`),
            { params: Promise.resolve({ planId }) },
        );

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toHaveProperty('checked');
    });

    it('returns 401 when unauthenticated', async () => {
        vi.mocked(requireUser).mockRejectedValue(new ApiError(401, 'Unauthorized'));
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { POST } = await import('@/app/api/shopping-list/[planId]/items/toggle/route');
        const res = await POST(
            makeRequest('POST', { ingredientName: 'Chicken breast' }, `http://localhost/api/shopping-list/${planId}/items/toggle`),
            { params: Promise.resolve({ planId }) },
        );

        expect(res.status).toBe(401);
    });
});
