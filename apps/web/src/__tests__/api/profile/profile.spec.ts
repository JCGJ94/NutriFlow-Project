import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

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

// ---- helpers -----------------------------------------------------------

const mockUser = { id: 'user-abc', app_metadata: {}, email: 'test@test.com' };

function makeRequest(body?: object, method = 'GET'): NextRequest {
    return new NextRequest('http://localhost/api/profile', {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: body ? { 'Content-Type': 'application/json' } : {},
    });
}

// ---- GET /api/profile --------------------------------------------------

describe('GET /api/profile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 200 with profile when authenticated', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);

        const dbProfile = {
            id: 'user-abc',
            username: 'testuser',
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
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
        };

        const sb = {
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: dbProfile, error: null }),
                    }),
                }),
            }),
        };
        vi.mocked(createClient).mockResolvedValue(sb as any);

        const { GET } = await import('@/app/api/profile/route');
        const req = makeRequest();
        const res = await GET(req);

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.id).toBe('user-abc');
        expect(body.weightKg).toBe(80);
    });

    it('returns 401 when unauthenticated', async () => {
        vi.mocked(requireUser).mockRejectedValue(new ApiError(401, 'Unauthorized'));
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { GET } = await import('@/app/api/profile/route');
        const req = makeRequest();
        const res = await GET(req);

        expect(res.status).toBe(401);
    });

    it('returns 404 when profile does not exist', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);

        const sb = {
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: null,
                            error: { code: 'PGRST116', message: '0 rows' },
                        }),
                    }),
                }),
            }),
        };
        vi.mocked(createClient).mockResolvedValue(sb as any);

        const { GET } = await import('@/app/api/profile/route');
        const req = makeRequest();
        const res = await GET(req);

        expect(res.status).toBe(404);
    });
});

// ---- PUT /api/profile --------------------------------------------------

describe('PUT /api/profile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 200 with updated profile on valid body', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);

        const dbProfile = {
            id: 'user-abc',
            username: 'testuser',
            age: 30,
            sex: 'MALE',
            weight_kg: 75,
            height_cm: 180,
            activity_level: 'MODERATELY_ACTIVE',
            meals_per_day: 3,
            diet_pattern: 'OMNIVORE',
            weight_goal_kg: 70,
            language: 'es',
            health_conditions: null,
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-02T00:00:00.000Z',
        };

        const sb = {
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: dbProfile, error: null }),
                    }),
                }),
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: dbProfile, error: null }),
                        }),
                    }),
                }),
            }),
        };
        vi.mocked(createClient).mockResolvedValue(sb as any);

        const { PUT } = await import('@/app/api/profile/route');
        const req = makeRequest(
            { weightKg: 75, age: 30, sex: 'MALE', heightCm: 180, activityLevel: 'MODERATELY_ACTIVE' },
            'PUT',
        );
        const res = await PUT(req);

        expect(res.status).toBe(200);
    });

    it('returns 401 when unauthenticated', async () => {
        vi.mocked(requireUser).mockRejectedValue(new ApiError(401, 'Unauthorized'));
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { PUT } = await import('@/app/api/profile/route');
        const req = makeRequest({ weightKg: 75 }, 'PUT');
        const res = await PUT(req);

        expect(res.status).toBe(401);
    });

    it('returns 400 when body is invalid JSON', async () => {
        vi.mocked(requireUser).mockResolvedValue(mockUser as any);
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { PUT } = await import('@/app/api/profile/route');
        // Send request with no body
        const req = new NextRequest('http://localhost/api/profile', { method: 'PUT' });
        const res = await PUT(req);

        expect(res.status).toBe(400);
    });
});
