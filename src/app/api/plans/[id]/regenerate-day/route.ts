import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser, ApiError } from '@/lib/auth/guards';
import { fetchFullPlan } from '@/lib/plans/fetch-full-plan';

// Vercel max function duration for LLM routes (design decision D4)
export const maxDuration = 60;

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
    try {
        const { id: planId } = await params;
        const sb = await createClient();
        const user = await requireUser(sb);

        const body = await req.json().catch(() => null);
        if (!body || typeof body.day !== 'number') {
            return NextResponse.json({ error: 'day (number) is required' }, { status: 400 });
        }

        // Verify ownership
        const plan = await fetchFullPlan(sb as any, planId, user.id);
        if (!plan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        const dayPlan = (plan.days as any[]).find((d: any) => d.dayOfWeek === body.day);
        if (!dayPlan) {
            return NextResponse.json({ error: 'Day not found in plan' }, { status: 404 });
        }

        const lockedMeals = dayPlan.meals.filter((m: any) => m.isLocked);
        if (lockedMeals.length > 0) {
            return NextResponse.json(
                { error: 'Cannot regenerate day because it has locked meals' },
                { status: 400 },
            );
        }

        // NOTE: Full day regeneration with LLM is a future enhancement.
        // For MVP behavior-preservation, we return the current plan (matches NestJS TODO behavior).
        const updatedPlan = await fetchFullPlan(sb as any, planId, user.id);
        return NextResponse.json(updatedPlan);
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('POST /api/plans/[id]/regenerate-day error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
