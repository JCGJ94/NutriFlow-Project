import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser, ApiError } from '@/lib/auth/guards';
import { DietPattern, UpsertProfileSchema } from '@/lib/contracts';

// ---- DB → DTO mapping --------------------------------------------------

function mapProfile(data: Record<string, unknown>) {
    return {
        id: data.id,
        username: data.username,
        age: data.age,
        sex: data.sex,
        weightKg: data.weight_kg,
        heightCm: data.height_cm,
        activityLevel: data.activity_level,
        mealsPerDay: data.meals_per_day,
        dietPattern: data.diet_pattern,
        weightGoalKg: data.weight_goal_kg,
        language: data.language,
        healthConditions: data.health_conditions,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
}

// ---- Handlers ----------------------------------------------------------

export async function GET(_req: NextRequest): Promise<NextResponse> {
    try {
        const sb = await createClient();
        const user = await requireUser(sb);

        const { data, error } = await sb
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error || !data) {
            if (error?.code === 'PGRST116' || !data) {
                return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
            }
            throw error;
        }

        return NextResponse.json(mapProfile(data as Record<string, unknown>));
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('GET /api/profile error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
    try {
        const sb = await createClient();
        const user = await requireUser(sb);

        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const parsed = UpsertProfileSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parsed.error.errors },
                { status: 400 },
            );
        }

        const dto = parsed.data;

        // Check if profile exists first
        const { data: existing } = await sb
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

        let result;
        if (existing) {
            const { data, error } = await sb
                .from('profiles')
                .update({
                    ...(dto.username !== undefined && { username: dto.username }),
                    ...(dto.age !== undefined && { age: dto.age }),
                    ...(dto.sex !== undefined && { sex: dto.sex }),
                    ...(dto.weightKg !== undefined && { weight_kg: dto.weightKg }),
                    ...(dto.heightCm !== undefined && { height_cm: dto.heightCm }),
                    ...(dto.activityLevel !== undefined && { activity_level: dto.activityLevel }),
                    ...(dto.mealsPerDay !== undefined && { meals_per_day: dto.mealsPerDay }),
                    ...(dto.dietPattern !== undefined && { diet_pattern: dto.dietPattern }),
                    ...(dto.weightGoalKg !== undefined && { weight_goal_kg: dto.weightGoalKg }),
                    ...(dto.language !== undefined && { language: dto.language }),
                    ...(dto.healthConditions !== undefined && {
                        health_conditions: dto.healthConditions,
                    }),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            const { data, error } = await sb
                .from('profiles')
                .insert({
                    id: user.id,
                    username: dto.username,
                    age: dto.age,
                    sex: dto.sex,
                    weight_kg: dto.weightKg,
                    height_cm: dto.heightCm,
                    activity_level: dto.activityLevel,
                    meals_per_day: dto.mealsPerDay ?? 3,
                    diet_pattern: dto.dietPattern ?? DietPattern.OMNIVORE,
                    weight_goal_kg: dto.weightGoalKg,
                    language: dto.language ?? 'es',
                    health_conditions: dto.healthConditions,
                })
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        return NextResponse.json(mapProfile(result as Record<string, unknown>));
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('PUT /api/profile error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
