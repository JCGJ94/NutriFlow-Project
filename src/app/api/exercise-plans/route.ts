import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser, ApiError } from '@/lib/auth/guards';
import { generateExercisePlan, ExerciseProfile } from '@/lib/exercise-engine';
import { ExerciseGoal, ActivityLevel } from '@/lib/contracts';

// ---- Helpers -----------------------------------------------------------

function determineGoal(profile: { weight_kg: number; weight_goal_kg?: number }): ExerciseGoal {
    if (!profile.weight_goal_kg) return ExerciseGoal.MAINTAIN;
    const diff = profile.weight_goal_kg - profile.weight_kg;
    if (diff < -2) return ExerciseGoal.LOSE_WEIGHT;
    if (diff > 2) return ExerciseGoal.BUILD_MUSCLE;
    return ExerciseGoal.MAINTAIN;
}

function getNextMonday(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7;
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    return nextMonday.toISOString().split('T')[0];
}

// ---- GET /api/exercise-plans -------------------------------------------

export async function GET(_req: NextRequest): Promise<NextResponse> {
    try {
        const sb = await createClient();
        const user = await requireUser(sb);

        const { data, error } = await sb
            .from('exercise_plans')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data || []);
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('GET /api/exercise-plans error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// ---- POST /api/exercise-plans ------------------------------------------

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const sb = await createClient();
        const user = await requireUser(sb);

        let body: { dietPlanId?: string } = {};
        try {
            const text = await req.text();
            if (text) body = JSON.parse(text);
        } catch {
            // empty body acceptable
        }

        // Load user profile
        const { data: profileData, error: profileError } = await sb
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError && profileError.code !== 'PGRST116') throw profileError;
        if (!profileData) {
            return NextResponse.json(
                { error: 'Perfil no encontrado. Crea tu perfil primero.' },
                { status: 400 },
            );
        }

        const goal = determineGoal(profileData);
        const weekStart = getNextMonday();

        const exerciseProfile: ExerciseProfile = {
            activityLevel: profileData.activity_level as ActivityLevel,
            goal,
            age: profileData.age,
            sex: profileData.sex,
            language: profileData.language as 'es' | 'en',
        };

        const plan = generateExercisePlan(exerciseProfile, weekStart);

        // Persist to exercise_plans table
        const { data: savedPlan, error: saveError } = await sb
            .from('exercise_plans')
            .insert({
                user_id: user.id,
                diet_plan_id: body.dietPlanId || null,
                plan_data: plan,
            })
            .select()
            .single();

        if (saveError) throw saveError;

        return NextResponse.json(savedPlan, { status: 201 });
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('POST /api/exercise-plans error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
