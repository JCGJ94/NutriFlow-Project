import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser, ApiError } from '@/lib/auth/guards';
import { fetchFullPlan } from '@/lib/plans/fetch-full-plan';

type RouteContext = { params: Promise<{ id: string }> };

// ---- GET /api/plans/[id] -----------------------------------------------

export async function GET(_req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
    try {
        const { id: planId } = await params;
        const sb = await createClient();
        const user = await requireUser(sb);

        const plan = await fetchFullPlan(sb as any, planId, user.id);

        if (!plan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        return NextResponse.json(plan);
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('GET /api/plans/[id] error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// ---- DELETE /api/plans/[id] --------------------------------------------

export async function DELETE(_req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
    try {
        const { id: planId } = await params;
        const sb = await createClient();
        const user = await requireUser(sb);

        // Verify ownership first
        const { data: plan, error: findError } = await sb
            .from('plans')
            .select('id, user_id')
            .eq('id', planId)
            .single();

        if (findError || !plan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        if ((plan as any).user_id !== user.id) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        const { error: deleteError } = await sb
            .from('plans')
            .delete()
            .eq('id', planId);

        if (deleteError) throw deleteError;

        return new NextResponse(null, { status: 204 });
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('DELETE /api/plans/[id] error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
