import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser, ApiError } from '@/lib/auth/guards';
import { fetchFullPlan } from '@/lib/plans/fetch-full-plan';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
    try {
        const { id: planId } = await params;
        const sb = await createClient();
        const user = await requireUser(sb);

        const body = await req.json().catch(() => null);
        if (!body || typeof body.mealId !== 'string' || typeof body.isLocked !== 'boolean') {
            return NextResponse.json(
                { error: 'mealId (string) and isLocked (boolean) are required' },
                { status: 400 },
            );
        }

        // Verify plan ownership
        const plan = await fetchFullPlan(sb as any, planId, user.id);
        if (!plan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        // Update meal lock state
        const { error: updateError } = await sb
            .from('plan_meals')
            .update({ is_locked: body.isLocked })
            .eq('id', body.mealId);

        if (updateError) throw updateError;

        return NextResponse.json({ mealId: body.mealId, isLocked: body.isLocked });
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('POST /api/plans/[id]/lock-meal error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
