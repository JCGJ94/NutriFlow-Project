import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        auth: { getSession: async () => ({ data: { session: null } }) },
    }),
}));

import { apiClient } from '@/lib/apiClient';

function mockFetchOnce(status: number, body: unknown) {
    const fetchMock = vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        statusText: 'status text',
        text: async () => (body === undefined ? '' : JSON.stringify(body)),
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

describe('apiClient', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('surfaces the route { error } message to the caller', async () => {
        mockFetchOnce(400, { error: 'Invalid input' });

        await expect(apiClient.get('/plans')).rejects.toThrow('Invalid input');
    });

    it('falls back to a status message when the body has no error', async () => {
        mockFetchOnce(502, { unexpected: true });

        await expect(apiClient.get('/plans')).rejects.toThrow('API Error: 502');
    });

    it('always calls the same-origin /api route handlers', async () => {
        const fetchMock = mockFetchOnce(200, { ok: true });

        await apiClient.get('/ingredients');

        expect(fetchMock.mock.calls[0][0]).toBe('/api/ingredients');
    });
});
