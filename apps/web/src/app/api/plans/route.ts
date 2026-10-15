import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser, ApiError } from '@/lib/auth/guards';

// ---- DTO mapping -------------------------------------------------------

function mapPlanSummary(p: Record<string, unknown>) {
    return {
        id: p.id,
        weekStart: p.week_start,
        targetKcal: p.target_kcal,
        status: p.status,
        createdAt: p.created_at,
    };
}

// ---- Handlers ----------------------------------------------------------

export async function GET(_req: NextRequest): Promise<NextResponse> {
    try {
        const sb = await createClient();
        const user = await requireUser(sb);

        const { data, error } = await sb
            .from('plans')
            .select('id, week_start, target_kcal, status, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json((data || []).map(mapPlanSummary));
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('GET /api/plans error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
