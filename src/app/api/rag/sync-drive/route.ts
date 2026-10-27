import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireAdminRole, ApiError } from '@/lib/auth/guards';
import { getGemini } from '@/lib/gemini';
import { listDriveFiles, getDriveFileContent, isSupportedMimeType } from '@/lib/google-drive';

// Vercel function timeout — syncing + embedding multiple Drive documents is slow.
export const maxDuration = 60;

// ---- POST /api/rag/sync-drive ------------------------------------------
// Auth: admin only (requireAdminRole)
// Body: none — syncs all files in the configured GOOGLE_DRIVE_FOLDER_ID
// Returns: { synced: number, total: number }
//
// Reads files from a public Google Drive folder, generates Gemini embeddings
// for supported document types (Docs, plain text, markdown), and upserts them
// into the Supabase `knowledge_docs` table via the service-role client.

export async function POST(_req: NextRequest): Promise<NextResponse> {
    try {
        const sb = await createClient();
        await requireAdminRole(sb);

        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        if (!folderId) {
            return NextResponse.json(
                { error: 'GOOGLE_DRIVE_FOLDER_ID is not configured' },
                { status: 500 },
            );
        }

        let files: Awaited<ReturnType<typeof listDriveFiles>>;
        try {
            files = await listDriveFiles(folderId);
        } catch (err: any) {
            return NextResponse.json(
                { error: `Drive API Error: ${err.message}` },
                { status: 502 },
            );
        }

        const gemini = getGemini();
        const adminSb = getSupabaseAdmin();
        let syncedCount = 0;

        for (const file of files) {
            if (!file.id || !file.name) continue;
            if (!isSupportedMimeType(file.mimeType)) continue;

            try {
                const content = await getDriveFileContent(file.id, file.mimeType);
                if (!content || content.trim().length === 0) continue;

                const embedding = await gemini.generateEmbedding(content);
                await adminSb
                    .from('knowledge_docs')
                    .insert({
                        content,
                        embedding,
                        metadata: {
                            source: 'google-drive',
                            fileName: file.name,
                            fileId: file.id,
                            syncAt: new Date().toISOString(),
                        },
                    })
                    .select()
                    .single();

                syncedCount++;
            } catch (err: any) {
                // Log but don't abort — best-effort sync, matches NestJS behavior
                console.error(`Failed to sync file ${file.name}: ${err.message}`);
            }
        }

        return NextResponse.json({
            synced: syncedCount,
            total: files.length,
            status: 'success',
        });
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('POST /api/rag/sync-drive error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
