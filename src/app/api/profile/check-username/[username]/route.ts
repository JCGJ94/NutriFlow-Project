import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser, ApiError } from '@/lib/auth/guards';

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ username: string }> },
): Promise<NextResponse> {
    try {
        const sb = await createClient();
        await requireUser(sb);

        const { username } = await params;

        const { data, error } = await sb
            .from('profiles')
            .select('username')
            .eq('username', username)
            .maybeSingle();

        if (error) {
            throw new Error(`Failed to check username: ${error.message}`);
        }

        return NextResponse.json({ available: !data });
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('GET /api/profile/check-username error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
