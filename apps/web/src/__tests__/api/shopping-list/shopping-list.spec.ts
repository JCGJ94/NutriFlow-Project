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

const togglePlanRow = { id: planId, user_id: 'user-123' };

function makeToggleClient(options: {
    item: unknown;
    itemError?: unknown;
    updated?: { id: string; is_checked: boolean };
    update?: ReturnType<typeof vi.fn>;
}) {
    const update =
        options.update ??
        vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    single: vi
                        .fn()
                        .mockResolvedValue({ data: options.updated ?? null, error: null }),
                }),
            }),
        });

    const from = vi.fn().mockImplementation((table: string) => {
        if (table === 'plans') {
            return {
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: togglePlanRow, error: null }),
                    }),
                }),
            };
        }
        if (table === 'shopping_list_items') {
            return {
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: options.item,
                            error: options.itemError ?? null,
                        }),
                    }),
                }),
                update,
            };
        }
        return { select: vi.fn() };
    });

    return { client: { from }, update };
}

function makeToggleRequest(body: object): NextRequest {
    return makeRequest(
        'POST',
        body,
        `http://localhost/api/shopping-list/${planId}/items/toggle`,
    );
}

describe('POST /api/shopping-list/[planId]/items/toggle', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it('sets the item to the requested checked state and returns it', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);
        const { client, update } = makeToggleClient({
            item: { id: 'item-1', shopping_lists: { plan_id: planId } },
            updated: { id: 'item-1', is_checked: true },
        });
        vi.mocked(createClient).mockResolvedValue(client as any);

        const { POST } = await import('@/app/api/shopping-list/[planId]/items/toggle/route');
        const res = await POST(makeToggleRequest({ itemId: 'item-1', isChecked: true }), {
            params: Promise.resolve({ planId }),
        });

        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ checked: true });
        expect(update).toHaveBeenCalledWith({ is_checked: true });
    });

    it('is idempotent: re-sending the same state does not flip it', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);
        const { client, update } = makeToggleClient({
            item: { id: 'item-1', shopping_lists: { plan_id: planId } },
            updated: { id: 'item-1', is_checked: false },
        });
        vi.mocked(createClient).mockResolvedValue(client as any);

        const { POST } = await import('@/app/api/shopping-list/[planId]/items/toggle/route');
        const res = await POST(makeToggleRequest({ itemId: 'item-1', isChecked: false }), {
            params: Promise.resolve({ planId }),
        });

        expect(res.status).toBe(200);
        expect(update).toHaveBeenCalledWith({ is_checked: false });
    });

    it('returns 404 when the item belongs to another plan', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);
        const { client, update } = makeToggleClient({
            item: { id: 'item-9', shopping_lists: { plan_id: 'other-plan' } },
        });
        vi.mocked(createClient).mockResolvedValue(client as any);

        const { POST } = await import('@/app/api/shopping-list/[planId]/items/toggle/route');
        const res = await POST(makeToggleRequest({ itemId: 'item-9', isChecked: true }), {
            params: Promise.resolve({ planId }),
        });

        expect(res.status).toBe(404);
        expect((await res.json()).error).toBe('Item not found');
        expect(update).not.toHaveBeenCalled();
    });

    it('returns 400 for the previous ingredientName body', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);
        const { client } = makeToggleClient({ item: null });
        vi.mocked(createClient).mockResolvedValue(client as any);

        const { POST } = await import('@/app/api/shopping-list/[planId]/items/toggle/route');
        const res = await POST(makeToggleRequest({ ingredientName: 'Chicken breast' }), {
            params: Promise.resolve({ planId }),
        });

        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('Invalid input');
    });

    it('returns 401 when unauthenticated', async () => {
        vi.mocked(requireUser).mockRejectedValue(new ApiError(401, 'Unauthorized'));
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { POST } = await import('@/app/api/shopping-list/[planId]/items/toggle/route');
        const res = await POST(makeToggleRequest({ itemId: 'item-1', isChecked: true }), {
            params: Promise.resolve({ planId }),
        });

        expect(res.status).toBe(401);
    });
});
