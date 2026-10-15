import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
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

const mockUser = { id: 'user-abc', app_metadata: {}, email: 'test@test.com' };

function makeRequest(body?: object, method = 'GET'): NextRequest {
    return new NextRequest('http://localhost/api/profile/allergens', {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: body ? { 'Content-Type': 'application/json' } : {},
    });
}

// ---- GET /api/profile/allergens ----------------------------------------

describe('GET /api/profile/allergens', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 200 with allergens array', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);

        const allergenRows = [
            {
                allergen_id: 'a1',
                allergens: { id: 'a1', name: 'Gluten', description: 'Wheat gluten' },
            },
        ];

        const sb = {
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ data: allergenRows, error: null }),
                }),
            }),
        };
        vi.mocked(createClient).mockResolvedValue(sb as any);

        const { GET } = await import('@/app/api/profile/allergens/route');
        const res = await GET(makeRequest());

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(Array.isArray(body.allergens)).toBe(true);
        expect(body.allergens[0].name).toBe('Gluten');
    });

    it('returns 401 when unauthenticated', async () => {
        vi.mocked(requireUser).mockRejectedValue(new ApiError(401, 'Unauthorized'));
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { GET } = await import('@/app/api/profile/allergens/route');
        const res = await GET(makeRequest());

        expect(res.status).toBe(401);
    });
});

// ---- PUT /api/profile/allergens ----------------------------------------

describe('PUT /api/profile/allergens', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 200 with updated allergens on valid array body', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);

        const allergenRows = [
            {
                allergen_id: 'a1',
                allergens: { id: 'a1', name: 'Gluten', description: null },
            },
        ];

        const sb = {
            from: vi.fn().mockReturnValue({
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null }),
                }),
                insert: vi.fn().mockResolvedValue({ error: null }),
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ data: allergenRows, error: null }),
                }),
            }),
        };
        vi.mocked(createClient).mockResolvedValue(sb as any);

        const { PUT } = await import('@/app/api/profile/allergens/route');
        const req = makeRequest({ allergenIds: ['a1'] }, 'PUT');
        const res = await PUT(req);

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(Array.isArray(body.allergens)).toBe(true);
    });

    it('returns 400 when body allergens field is not an array', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { PUT } = await import('@/app/api/profile/allergens/route');
        const req = makeRequest({ allergenIds: 'gluten' }, 'PUT');
        const res = await PUT(req);

        expect(res.status).toBe(400);
    });

    it('returns 401 when unauthenticated', async () => {
        vi.mocked(requireUser).mockRejectedValue(new ApiError(401, 'Unauthorized'));
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { PUT } = await import('@/app/api/profile/allergens/route');
        const req = makeRequest({ allergenIds: [] }, 'PUT');
        const res = await PUT(req);

        expect(res.status).toBe(401);
    });
});
