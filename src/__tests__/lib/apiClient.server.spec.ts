// @vitest-environment node
import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('next/headers', () => ({
    cookies: async () => ({
        getAll: () => [
            { name: 'sb-access-token', value: 'abc' },
            { name: 'sb-refresh-token', value: 'def' },
        ],
    }),
}));
vi.mock('@/lib/supabase/server', () => ({
    createClient: async () => ({ auth: { getSession: async () => ({ data: { session: null } }) } }),
}));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({}) }));

import { apiClient } from '@/lib/apiClient';

describe('apiClient on the server', () => {
    afterEach(() => vi.unstubAllGlobals());

    it("forwards the visitor's cookies so the route handler can authenticate them", async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => '{}' });
        vi.stubGlobal('fetch', fetchMock);

        await apiClient.get('/plans');

        const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
        expect(headers.Cookie).toBe('sb-access-token=abc; sb-refresh-token=def');
    });
});
