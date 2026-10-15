import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser, ApiError } from '@/lib/auth/guards';
import { PlanStatus } from '@nutriflow/shared';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
    try {
        const { id: planId } = await params;
        const sb = await createClient();
        const user = await requireUser(sb);

        // Verify ownership
        const { data: plan, error: findError } = await sb
            .from('plans')
            .select('id, user_id')
            .eq('id', planId)
            .single();

        if (findError || !plan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        if (plan.user_id !== user.id) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        const { error: updateError } = await sb
            .from('plans')
            .update({ status: PlanStatus.ARCHIVED })
            .eq('id', planId);

        if (updateError) throw updateError;

        return NextResponse.json({ status: PlanStatus.ARCHIVED });
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('POST /api/plans/[id]/archive error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
