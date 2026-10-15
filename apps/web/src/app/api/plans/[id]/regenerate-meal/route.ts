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
        if (!body || typeof body.mealId !== 'string') {
            return NextResponse.json({ error: 'mealId is required' }, { status: 400 });
        }

        // Verify ownership
        const plan = await fetchFullPlan(sb as any, planId, user.id);
        if (!plan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        // Find the meal across all days
        let targetMeal: any = null;
        for (const day of (plan.days as any[])) {
            const found = day.meals.find((m: any) => m.id === body.mealId);
            if (found) {
                targetMeal = found;
                break;
            }
        }

        if (!targetMeal) {
            return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
        }

        if (targetMeal.isLocked) {
            return NextResponse.json({ error: 'Cannot regenerate a locked meal' }, { status: 400 });
        }

        // NOTE: Full meal regeneration with LLM is a future enhancement.
        // For MVP behavior-preservation, we return the current plan (matches NestJS TODO behavior).
        const updatedPlan = await fetchFullPlan(sb as any, planId, user.id);
        return NextResponse.json(updatedPlan);
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('POST /api/plans/[id]/regenerate-meal error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
