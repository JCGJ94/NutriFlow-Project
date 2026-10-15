import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser, ApiError } from '@/lib/auth/guards';
import { getGemini } from '@/lib/gemini';

export interface SearchResult {
    id: string;
    content: string;
    metadata: any;
    similarity: number;
}

// ---- GET /api/rag/search -----------------------------------------------
// Auth: requireUser (any authenticated user can search the knowledge base)
// Query: ?q=string
// Returns: { results: SearchResult[] }

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const sb = await createClient();
        await requireUser(sb);

        const query = req.nextUrl.searchParams.get('q')?.trim() ?? '';
        if (!query) {
            return NextResponse.json(
                { error: 'Missing or empty query parameter: q' },
                { status: 400 },
            );
        }

        // Generate embedding for the query string
        const gemini = getGemini();
        const embedding = await gemini.generateEmbedding(query);

        // Semantic search via pgvector RPC
        const { data, error } = await sb.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.7,
            match_count: 5,
        });

        if (error) {
            throw new Error(`Vector search failed: ${error.message}`);
        }

        return NextResponse.json({ results: (data ?? []) as SearchResult[] });
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('GET /api/rag/search error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
