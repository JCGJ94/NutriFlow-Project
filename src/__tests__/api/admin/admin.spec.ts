import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---- Mock modules before any imports -----------------------------------

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(),
}));

vi.mock('@/lib/supabase/admin', () => ({
    getSupabaseAdmin: vi.fn(),
    _resetAdminClientCache: vi.fn(),
}));

vi.mock('@/lib/auth/guards', () => ({
    requireAdminRole: vi.fn(),
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
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireAdminRole, ApiError } from '@/lib/auth/guards';

// ---- Helpers -----------------------------------------------------------

const adminUser = { id: 'admin-1', app_metadata: { role: 'admin' }, email: 'admin@test.com' };

function makeRequest(
    method = 'GET',
    body?: object,
    url = 'http://localhost/api/admin/ingredients',
): NextRequest {
    return new NextRequest(url, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: body ? { 'Content-Type': 'application/json' } : {},
    });
}

// ---- GET /api/admin/ingredients ----------------------------------------

describe('GET /api/admin/ingredients', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it('returns 200 with ingredients list for admin user', async () => {
        vi.mocked(requireAdminRole).mockResolvedValue(adminUser as any);

        const ingredients = [
            { id: 'ing-1', name: 'Chicken', category: 'protein', kcal_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6, fiber_per_100g: 0, is_vegan: false, is_vegetarian: false, created_at: '2024-01-01T00:00:00Z' },
        ];

        const adminSb = {
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({ data: ingredients, error: null }),
                }),
            }),
        };
        vi.mocked(createClient).mockResolvedValue({} as any);
        vi.mocked(getSupabaseAdmin).mockReturnValue(adminSb as any);

        const { GET } = await import('@/app/api/admin/ingredients/route');
        const res = await GET(makeRequest());

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body[0].id).toBe('ing-1');
    });

    it('returns 403 for non-admin user', async () => {
        vi.mocked(requireAdminRole).mockRejectedValue(new ApiError(403, 'Forbidden'));
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { GET } = await import('@/app/api/admin/ingredients/route');
        const res = await GET(makeRequest());

        expect(res.status).toBe(403);
    });

    it('returns 401 for unauthenticated request', async () => {
        vi.mocked(requireAdminRole).mockRejectedValue(new ApiError(401, 'Unauthorized'));
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { GET } = await import('@/app/api/admin/ingredients/route');
        const res = await GET(makeRequest());

        expect(res.status).toBe(401);
    });
});

// ---- POST /api/admin/ingredients ----------------------------------------

describe('POST /api/admin/ingredients', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it('creates ingredient and returns 201 for admin user', async () => {
        vi.mocked(requireAdminRole).mockResolvedValue(adminUser as any);

        const newIngredient = {
            id: 'ing-new',
            name: 'Salmon',
            category: 'protein',
            kcal_per_100g: 208,
            protein_per_100g: 20,
            carbs_per_100g: 0,
            fat_per_100g: 13,
            fiber_per_100g: 0,
            is_vegan: false,
            is_vegetarian: false,
            created_at: '2024-01-01T00:00:00Z',
        };

        const adminSb = {
            from: vi.fn().mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: newIngredient, error: null }),
                    }),
                }),
            }),
        };
        vi.mocked(createClient).mockResolvedValue({} as any);
        vi.mocked(getSupabaseAdmin).mockReturnValue(adminSb as any);

        const body = {
            name: 'Salmon',
            category: 'protein',
            kcalPer100g: 208,
            proteinPer100g: 20,
            carbsPer100g: 0,
            fatPer100g: 13,
        };

        const { POST } = await import('@/app/api/admin/ingredients/route');
        const res = await POST(makeRequest('POST', body));

        expect(res.status).toBe(201);
        const resBody = await res.json();
        expect(resBody.id).toBe('ing-new');
        expect(resBody.name).toBe('Salmon');
    });

    it('returns 403 for non-admin user', async () => {
        vi.mocked(requireAdminRole).mockRejectedValue(new ApiError(403, 'Forbidden'));
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { POST } = await import('@/app/api/admin/ingredients/route');
        const res = await POST(makeRequest('POST', { name: 'X', category: 'protein', kcalPer100g: 1, proteinPer100g: 1, carbsPer100g: 0, fatPer100g: 0 }));

        expect(res.status).toBe(403);
    });

    it('returns 400 for missing required fields', async () => {
        vi.mocked(requireAdminRole).mockResolvedValue(adminUser as any);
        vi.mocked(createClient).mockResolvedValue({} as any);
        vi.mocked(getSupabaseAdmin).mockReturnValue({} as any);

        const { POST } = await import('@/app/api/admin/ingredients/route');
        const res = await POST(makeRequest('POST', { name: 'Missing fields' }));

        expect(res.status).toBe(400);
    });
});

// ---- GET /api/admin/allergens ------------------------------------------

describe('GET /api/admin/allergens', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it('returns 200 with allergens list for admin user', async () => {
        vi.mocked(requireAdminRole).mockResolvedValue(adminUser as any);

        const allergens = [
            { id: 'a-1', name: 'Gluten', description: 'Wheat gluten' },
            { id: 'a-2', name: 'Lactose', description: 'Milk sugar' },
        ];

        const adminSb = {
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({ data: allergens, error: null }),
                }),
            }),
        };
        vi.mocked(createClient).mockResolvedValue({} as any);
        vi.mocked(getSupabaseAdmin).mockReturnValue(adminSb as any);

        const { GET } = await import('@/app/api/admin/allergens/route');
        const res = await GET(makeRequest('GET', undefined, 'http://localhost/api/admin/allergens'));

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body).toHaveLength(2);
    });

    it('returns 403 for non-admin user', async () => {
        vi.mocked(requireAdminRole).mockRejectedValue(new ApiError(403, 'Forbidden'));
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { GET } = await import('@/app/api/admin/allergens/route');
        const res = await GET(makeRequest('GET', undefined, 'http://localhost/api/admin/allergens'));

        expect(res.status).toBe(403);
    });
});

// ---- POST /api/admin/allergens -----------------------------------------

describe('POST /api/admin/allergens', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it('creates allergen and returns 201 for admin user', async () => {
        vi.mocked(requireAdminRole).mockResolvedValue(adminUser as any);

        const newAllergen = { id: 'a-new', name: 'Soy', description: 'Soybean allergen' };

        const adminSb = {
            from: vi.fn().mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: newAllergen, error: null }),
                    }),
                }),
            }),
        };
        vi.mocked(createClient).mockResolvedValue({} as any);
        vi.mocked(getSupabaseAdmin).mockReturnValue(adminSb as any);

        const { POST } = await import('@/app/api/admin/allergens/route');
        const res = await POST(makeRequest('POST', { name: 'Soy', description: 'Soybean allergen' }, 'http://localhost/api/admin/allergens'));

        expect(res.status).toBe(201);
        const body = await res.json();
        expect(body.name).toBe('Soy');
    });

    it('returns 400 for missing name', async () => {
        vi.mocked(requireAdminRole).mockResolvedValue(adminUser as any);
        vi.mocked(createClient).mockResolvedValue({} as any);
        vi.mocked(getSupabaseAdmin).mockReturnValue({} as any);

        const { POST } = await import('@/app/api/admin/allergens/route');
        const res = await POST(makeRequest('POST', {}, 'http://localhost/api/admin/allergens'));

        expect(res.status).toBe(400);
    });
});
