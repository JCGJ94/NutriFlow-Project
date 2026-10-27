import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireAdminRole, ApiError } from '@/lib/auth/guards';
import { getGemini } from '@/lib/gemini';

// Vercel function timeout — embedding multiple docs can be slow.
export const maxDuration = 60;

// ---- POST /api/rag/ingest ----------------------------------------------
// Auth: admin only (requireAdminRole)
// Body: { content: string; metadata?: Record<string, any> }
// Returns: { ingested: number }
//
// Ingests a single document: generates a Gemini embedding for the content,
// then upserts the vector into the Supabase `knowledge_docs` table via the
// service-role client (bypasses RLS).

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const sb = await createClient();
        await requireAdminRole(sb);

        const body = await req.json().catch(() => null);
        if (!body || typeof body.content !== 'string' || !body.content.trim()) {
            return NextResponse.json(
                { error: 'Missing required field: content (string)' },
                { status: 400 },
            );
        }

        const content: string = body.content.trim();
        const metadata: Record<string, any> = body.metadata ?? {};

        // Generate embedding for the document content
        const gemini = getGemini();
        const embedding = await gemini.generateEmbedding(content);

        // Insert into knowledge_docs using service-role client (bypasses RLS)
        const adminSb = getSupabaseAdmin();
        const { error } = await adminSb
            .from('knowledge_docs')
            .insert({ content, embedding, metadata })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to insert document: ${error.message}`);
        }

        return NextResponse.json({ ingested: 1, status: 'success' });
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('POST /api/rag/ingest error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
