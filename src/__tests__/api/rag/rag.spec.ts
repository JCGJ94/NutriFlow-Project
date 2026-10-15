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

vi.mock('@/lib/gemini', () => ({
    getGemini: vi.fn(),
    _resetGeminiCache: vi.fn(),
}));

vi.mock('@/lib/google-drive', () => ({
    listDriveFiles: vi.fn(),
    getDriveFileContent: vi.fn(),
    isSupportedMimeType: vi.fn((mimeType: string) =>
        ['application/vnd.google-apps.document', 'text/plain', 'text/markdown'].includes(mimeType)
    ),
}));

import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireAdminRole, requireUser, ApiError } from '@/lib/auth/guards';
import { getGemini } from '@/lib/gemini';
import { listDriveFiles, getDriveFileContent } from '@/lib/google-drive';

// ---- Helpers -----------------------------------------------------------

const adminUser = { id: 'admin-1', app_metadata: { role: 'admin' }, email: 'admin@test.com' };
const regularUser = { id: 'user-1', app_metadata: {}, email: 'user@test.com' };

function makeRequest(
    method = 'GET',
    body?: object,
    url = 'http://localhost/api/rag/search',
): NextRequest {
    return new NextRequest(url, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: body ? { 'Content-Type': 'application/json' } : {},
    });
}

function makeSearchRequest(query?: string): NextRequest {
    const url = query
        ? `http://localhost/api/rag/search?q=${encodeURIComponent(query)}`
        : 'http://localhost/api/rag/search';
    return new NextRequest(url, { method: 'GET' });
}

// ---- GET /api/rag/search -----------------------------------------------

describe('GET /api/rag/search', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it('returns 200 with results for authenticated user with query', async () => {
        vi.mocked(requireUser).mockResolvedValue(regularUser as any);

        const embedding = [0.1, 0.2, 0.3];
        const mockResults = [
            { id: 'doc-1', content: 'Protein macros info', metadata: { source: 'manual' }, similarity: 0.92 },
        ];

        const mockGemini = {
            generateEmbedding: vi.fn().mockResolvedValue(embedding),
        };
        vi.mocked(getGemini).mockReturnValue(mockGemini as any);

        const mockSb = {
            rpc: vi.fn().mockResolvedValue({ data: mockResults, error: null }),
        };
        vi.mocked(createClient).mockResolvedValue(mockSb as any);

        const { GET } = await import('@/app/api/rag/search/route');
        const res = await GET(makeSearchRequest('protein macros calculation'));

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.results).toHaveLength(1);
        expect(body.results[0].id).toBe('doc-1');
        expect(mockGemini.generateEmbedding).toHaveBeenCalledWith('protein macros calculation');
        expect(mockSb.rpc).toHaveBeenCalledWith('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.7,
            match_count: 5,
        });
    });

    it('returns 400 for missing query param', async () => {
        vi.mocked(requireUser).mockResolvedValue(regularUser as any);
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { GET } = await import('@/app/api/rag/search/route');
        const res = await GET(makeSearchRequest()); // no ?q=

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toBeDefined();
    });

    it('returns 401 for unauthenticated request', async () => {
        vi.mocked(requireUser).mockRejectedValue(new ApiError(401, 'Unauthorized'));
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { GET } = await import('@/app/api/rag/search/route');
        const res = await GET(makeSearchRequest('test'));

        expect(res.status).toBe(401);
    });

    it('returns 200 with empty results for empty query string after trim', async () => {
        vi.mocked(requireUser).mockResolvedValue(regularUser as any);
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { GET } = await import('@/app/api/rag/search/route');
        const req = new NextRequest('http://localhost/api/rag/search?q=', { method: 'GET' });
        const res = await GET(req);

        expect(res.status).toBe(400);
    });
});

// ---- POST /api/rag/ingest ----------------------------------------------

describe('POST /api/rag/ingest', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it('returns 403 for non-admin user', async () => {
        vi.mocked(requireAdminRole).mockRejectedValue(new ApiError(403, 'Forbidden'));
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { POST } = await import('@/app/api/rag/ingest/route');
        const res = await POST(makeRequest('POST', { content: 'test doc' }, 'http://localhost/api/rag/ingest'));

        expect(res.status).toBe(403);
    });

    it('calls embedding and inserts document for admin user', async () => {
        vi.mocked(requireAdminRole).mockResolvedValue(adminUser as any);

        const embedding = [0.5, 0.6, 0.7];
        const newDoc = { id: 'doc-new', content: 'test content', embedding, metadata: {} };

        const mockGemini = {
            generateEmbedding: vi.fn().mockResolvedValue(embedding),
        };
        vi.mocked(getGemini).mockReturnValue(mockGemini as any);

        const adminSb = {
            from: vi.fn().mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: newDoc, error: null }),
                    }),
                }),
            }),
        };
        vi.mocked(createClient).mockResolvedValue({} as any);
        vi.mocked(getSupabaseAdmin).mockReturnValue(adminSb as any);

        const { POST } = await import('@/app/api/rag/ingest/route');
        const res = await POST(
            makeRequest('POST', { content: 'test content', metadata: { source: 'manual' } }, 'http://localhost/api/rag/ingest'),
        );

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.ingested).toBe(1);
        expect(mockGemini.generateEmbedding).toHaveBeenCalledWith('test content');
        expect(adminSb.from).toHaveBeenCalledWith('knowledge_docs');
    });

    it('returns 400 for missing content field', async () => {
        vi.mocked(requireAdminRole).mockResolvedValue(adminUser as any);
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { POST } = await import('@/app/api/rag/ingest/route');
        const res = await POST(makeRequest('POST', {}, 'http://localhost/api/rag/ingest'));

        expect(res.status).toBe(400);
    });

    it('returns 401 for unauthenticated request', async () => {
        vi.mocked(requireAdminRole).mockRejectedValue(new ApiError(401, 'Unauthorized'));
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { POST } = await import('@/app/api/rag/ingest/route');
        const res = await POST(makeRequest('POST', { content: 'test' }, 'http://localhost/api/rag/ingest'));

        expect(res.status).toBe(401);
    });
});

// ---- POST /api/rag/sync-drive ------------------------------------------

describe('POST /api/rag/sync-drive', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it('returns 403 for non-admin user', async () => {
        vi.mocked(requireAdminRole).mockRejectedValue(new ApiError(403, 'Forbidden'));
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { POST } = await import('@/app/api/rag/sync-drive/route');
        const res = await POST(makeRequest('POST', undefined, 'http://localhost/api/rag/sync-drive'));

        expect(res.status).toBe(403);
    });

    it('calls drive sync and returns ingested count for admin user', async () => {
        vi.mocked(requireAdminRole).mockResolvedValue(adminUser as any);

        const driveFiles = [
            { id: 'file-1', name: 'nutrition-guide.md', mimeType: 'text/markdown' },
            { id: 'file-2', name: 'image.png', mimeType: 'image/png' }, // should be skipped
        ];
        const embedding = [0.1, 0.2, 0.3];
        const docResult = { id: 'doc-1', content: 'nutrition content', embedding, metadata: {} };

        vi.mocked(listDriveFiles).mockResolvedValue(driveFiles as any);
        vi.mocked(getDriveFileContent).mockResolvedValue('nutrition content');

        const mockGemini = {
            generateEmbedding: vi.fn().mockResolvedValue(embedding),
        };
        vi.mocked(getGemini).mockReturnValue(mockGemini as any);

        const adminSb = {
            from: vi.fn().mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: docResult, error: null }),
                    }),
                }),
            }),
        };
        vi.mocked(createClient).mockResolvedValue({} as any);
        vi.mocked(getSupabaseAdmin).mockReturnValue(adminSb as any);

        // Set env so folderId is found
        const originalEnv = process.env.GOOGLE_DRIVE_FOLDER_ID;
        process.env.GOOGLE_DRIVE_FOLDER_ID = 'folder-123';

        const { POST } = await import('@/app/api/rag/sync-drive/route');
        const res = await POST(makeRequest('POST', undefined, 'http://localhost/api/rag/sync-drive'));

        process.env.GOOGLE_DRIVE_FOLDER_ID = originalEnv;

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.synced).toBe(1); // only the markdown file, not the image
        expect(listDriveFiles).toHaveBeenCalledWith('folder-123');
        expect(mockGemini.generateEmbedding).toHaveBeenCalledWith('nutrition content');
    });

    it('returns 401 for unauthenticated request', async () => {
        vi.mocked(requireAdminRole).mockRejectedValue(new ApiError(401, 'Unauthorized'));
        vi.mocked(createClient).mockResolvedValue({} as any);

        const { POST } = await import('@/app/api/rag/sync-drive/route');
        const res = await POST(makeRequest('POST', undefined, 'http://localhost/api/rag/sync-drive'));

        expect(res.status).toBe(401);
    });
});
