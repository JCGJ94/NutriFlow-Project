import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser, ApiError } from '@/lib/auth/guards';
import { generateWeeklyPlan } from '@/lib/diet-engine';
import { generateExercisePlan, ExerciseProfile } from '@/lib/exercise-engine';
import { translatePlan } from '@/lib/llm/narration';
import { fetchFullPlan } from '@/lib/plans/fetch-full-plan';
import type { UserProfile, IngredientData } from '@/lib/diet-engine/types';
import { DietPattern, PlanStatus } from '@nutriflow/shared';

// Vercel max function duration for LLM routes (design decision D4)
export const maxDuration = 60;

// ---- Helpers -----------------------------------------------------------

/**
 * Calculate the Monday of the week containing `dateStr`.
 * If no date given, returns the next Monday from today.
 */
function calculateWeekStart(dateStr?: string): string {
    let date: Date;

    if (dateStr) {
        date = new Date(dateStr);
    } else {
        date = new Date();
    }

    const dayOfWeek = date.getDay();

    if (!dateStr) {
        const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7;
        date.setDate(date.getDate() + daysUntilMonday);
    } else {
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        if (daysToMonday > 0) {
            date.setDate(date.getDate() - daysToMonday);
        }
    }

    return date.toISOString().split('T')[0];
}

function determineExerciseGoal(profile: { weight_kg: number; weight_goal_kg?: number }): string {
    if (!profile.weight_goal_kg) return 'maintain';
    const diff = profile.weight_goal_kg - profile.weight_kg;
    if (diff < -2) return 'lose_weight';
    if (diff > 2) return 'build_muscle';
    return 'maintain';
}

// ---- Handler -----------------------------------------------------------

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const sb = await createClient();
        const user = await requireUser(sb);

        // Parse optional body
        let body: { weekStart?: string } = {};
        try {
            const text = await req.text();
            if (text) body = JSON.parse(text);
        } catch {
            // empty body is fine
        }

        // ---- Plan limit check (max 3 active plans) ----------------------
        const { data: existingPlans, error: plansError } = await sb
            .from('plans')
            .select('id, created_at, status')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

        if (plansError) throw plansError;

        if ((existingPlans || []).length >= 3) {
            // Auto-archive the oldest plan
            const sorted = [...(existingPlans || [])].sort(
                (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            );
            const oldest = sorted[0] as any;
            if (oldest) {
                const { error: archiveError } = await sb
                    .from('plans')
                    .update({ status: PlanStatus.ARCHIVED })
                    .eq('id', oldest.id);
                if (archiveError) throw archiveError;
            }
        }

        // ---- Load profile -----------------------------------------------
        const { data: profileData, error: profileError } = await sb
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError && profileError.code !== 'PGRST116') throw profileError;
        if (!profileData) {
            return NextResponse.json(
                { error: 'Debes crear tu perfil nutricional primero' },
                { status: 400 },
            );
        }

        // ---- Load allergens ---------------------------------------------
        const { data: allergenData } = await sb
            .from('user_allergens')
            .select('allergen_id')
            .eq('user_id', user.id);

        const allergenIds = (allergenData || []).map((a: any) => a.allergen_id);

        // ---- Load ingredients -------------------------------------------
        const { data: ingredientData } = await sb
            .from('ingredients')
            .select('*');

        const ingredients: IngredientData[] = (ingredientData || []).map((i: any) => ({
            id: i.id,
            name: i.name,
            category: i.category,
            allergenIds: i.allergen_ids || [],
            kcalPer100g: i.kcal_per_100g,
            proteinPer100g: i.protein_per_100g,
            carbsPer100g: i.carbs_per_100g,
            fatPer100g: i.fat_per_100g,
            fiberPer100g: i.fiber_per_100g ?? 0,
            isVegan: i.is_vegan ?? false,
            isVegetarian: i.is_vegetarian ?? false,
            dietPatterns: i.diet_patterns || [],
        }));

        // ---- Build UserProfile for engine --------------------------------
        const p = profileData as any;
        const userProfile: UserProfile = {
            id: user.id,
            age: p.age,
            sex: p.sex,
            weightKg: p.weight_kg,
            heightCm: p.height_cm,
            activityLevel: p.activity_level,
            mealsPerDay: p.meals_per_day ?? 3,
            dietPattern: p.diet_pattern ?? DietPattern.OMNIVORE,
            weightGoalKg: p.weight_goal_kg,
            allergenIds,
            language: p.language ?? 'es',
            healthConditions: p.health_conditions,
        };

        // ---- Generate diet plan -----------------------------------------
        const weekStart = calculateWeekStart(body.weekStart);
        let generatedPlan = generateWeeklyPlan(userProfile, ingredients, weekStart);

        // Auto-translate if user language is English
        if (userProfile.language === 'en') {
            try {
                generatedPlan = await translatePlan(generatedPlan, 'en');
            } catch (translationErr) {
                console.error('Failed to translate plan, falling back to Spanish:', translationErr);
            }
        }

        // ---- Persist plan to Supabase ------------------------------------
        const { data: savedPlan, error: savePlanError } = await sb
            .from('plans')
            .insert({
                user_id: user.id,
                week_start: generatedPlan.weekStart,
                target_kcal: generatedPlan.targetKcal,
                target_protein: generatedPlan.targetProtein,
                target_carbs: generatedPlan.targetCarbs,
                target_fat: generatedPlan.targetFat,
                status: PlanStatus.ACTIVE,
            })
            .select()
            .single();

        if (savePlanError) throw savePlanError;

        // Persist meals and items
        for (const day of generatedPlan.days) {
            for (const meal of day.meals) {
                const { data: savedMeal, error: mealError } = await sb
                    .from('plan_meals')
                    .insert({
                        plan_id: (savedPlan as any).id,
                        day_of_week: day.dayOfWeek,
                        meal_type: meal.mealType,
                        is_locked: false,
                        total_kcal: meal.totalKcal,
                    })
                    .select()
                    .single();

                if (mealError) throw mealError;

                if (meal.items.length > 0) {
                    const mealItems = meal.items.map((item: any) => ({
                        meal_id: (savedMeal as any).id,
                        ingredient_id: item.ingredientId,
                        grams: item.grams,
                        kcal: item.kcal,
                        protein: item.protein,
                        carbs: item.carbs,
                        fat: item.fat,
                    }));

                    const { error: itemsError } = await sb
                        .from('plan_meal_items')
                        .insert(mealItems);

                    if (itemsError) throw itemsError;
                }
            }
        }

        // ---- Generate linked exercise plan (non-blocking) ----------------
        try {
            const exerciseProfile: ExerciseProfile = {
                activityLevel: p.activity_level,
                goal: determineExerciseGoal(p) as any,
                age: p.age,
                sex: p.sex,
                language: p.language as 'es' | 'en',
            };
            generateExercisePlan(exerciseProfile, weekStart);
        } catch (exerciseErr) {
            console.error('Failed to generate linked exercise plan (non-blocking):', exerciseErr);
        }

        // ---- Fetch full plan with meals and return -----------------------
        const fullPlan = await fetchFullPlan(sb as any, (savedPlan as any).id, user.id);
        return NextResponse.json(fullPlan, { status: 201 });
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('POST /api/plans/generate-week error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
