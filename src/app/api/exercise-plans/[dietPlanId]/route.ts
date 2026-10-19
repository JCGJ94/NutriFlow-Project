import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser, ApiError } from '@/lib/auth/guards';

type RouteContext = { params: Promise<{ dietPlanId: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
    try {
        const { dietPlanId } = await params;
        const sb = await createClient();
        const user = await requireUser(sb);

        const { data, error } = await sb
            .from('exercise_plans')
            .select('*')
            .eq('diet_plan_id', dietPlanId)
            .eq('user_id', user.id)
            .single();

        if (error || !data) {
            return NextResponse.json(
                { error: 'Exercise plan not found' },
                { status: 404 },
            );
        }

        return NextResponse.json((data as { plan_data: unknown }).plan_data);
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('GET /api/exercise-plans/[dietPlanId] error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
