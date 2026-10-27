import { describe, it, expect, vi } from 'vitest';
import { requireUser, requireAdminRole, ApiError } from '../../../lib/auth/guards';

// ---- helpers -----------------------------------------------------------

function makeSupabase(user: object | null, error: object | null = null) {
    return {
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user }, error }),
        },
    };
}

// ---- requireUser -------------------------------------------------------

describe('requireUser', () => {
    it('returns the user when authenticated', async () => {
        const user = { id: 'user-123', app_metadata: {}, email: 'a@a.com' };
        const sb = makeSupabase(user);
        const result = await requireUser(sb as any);
        expect(result).toBe(user);
    });

    it('throws ApiError(401) when no user (null)', async () => {
        const sb = makeSupabase(null);
        await expect(requireUser(sb as any)).rejects.toThrow(ApiError);
        await expect(requireUser(sb as any)).rejects.toMatchObject({ status: 401 });
    });

    it('throws ApiError(401) when getUser returns an error', async () => {
        const sb = makeSupabase(null, { message: 'JWT expired' });
        await expect(requireUser(sb as any)).rejects.toMatchObject({ status: 401 });
    });
});

// ---- requireAdminRole --------------------------------------------------

describe('requireAdminRole', () => {
    it('returns the user when role is admin', async () => {
        const user = { id: 'admin-1', app_metadata: { role: 'admin' }, email: 'admin@a.com' };
        const sb = makeSupabase(user);
        const result = await requireAdminRole(sb as any);
        expect(result).toBe(user);
    });

    it('throws ApiError(403) when role is not admin', async () => {
        const user = { id: 'user-2', app_metadata: { role: 'authenticated' }, email: 'u@a.com' };
        const sb = makeSupabase(user);
        await expect(requireAdminRole(sb as any)).rejects.toMatchObject({ status: 403 });
    });

    it('throws ApiError(403) when app_metadata has no role field', async () => {
        const user = { id: 'user-3', app_metadata: {}, email: 'u@a.com' };
        const sb = makeSupabase(user);
        await expect(requireAdminRole(sb as any)).rejects.toMatchObject({ status: 403 });
    });

    it('throws ApiError(401) when not authenticated (propagates from requireUser)', async () => {
        const sb = makeSupabase(null);
        await expect(requireAdminRole(sb as any)).rejects.toMatchObject({ status: 401 });
    });
});
