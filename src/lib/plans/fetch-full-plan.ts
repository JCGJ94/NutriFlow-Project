import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Fetch a full plan with all days, meals, and items from Supabase.
 * Returns null if the plan does not exist OR does not belong to userId.
 * Mirrors PlansRepository.findById from the NestJS app.
 */
export async function fetchFullPlan(
    sb: SupabaseClient,
    planId: string,
    userId: string,
): Promise<Record<string, unknown> | null> {
    const { data: plan, error: planError } = await sb
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single();

    if (planError || !plan) {
        return null;
    }

    if ((plan as any).user_id !== userId) {
        return null;
    }

    const { data: meals } = await sb
        .from('plan_meals')
        .select(`
            *,
            plan_meal_items (
                id,
                ingredient_id,
                grams,
                kcal,
                protein,
                carbs,
                fat,
                ingredients (name)
            )
        `)
        .eq('plan_id', planId)
        .order('day_of_week')
        .order('meal_type');

    const dayMap = new Map<number, any[]>();
    for (const meal of (meals as any[]) || []) {
        const mealDto = {
            id: meal.id,
            dayOfWeek: meal.day_of_week,
            mealType: meal.meal_type,
            isLocked: meal.is_locked,
            totalKcal: meal.total_kcal,
            items: (meal.plan_meal_items || []).map((item: any) => ({
                id: item.id,
                ingredientId: item.ingredient_id,
                ingredientName: item.ingredients?.name || 'Unknown',
                grams: item.grams,
                kcal: item.kcal,
                protein: item.protein,
                carbs: item.carbs,
                fat: item.fat,
            })),
        };
        if (!dayMap.has(meal.day_of_week)) dayMap.set(meal.day_of_week, []);
        dayMap.get(meal.day_of_week)!.push(mealDto);
    }

    const days = [];
    for (let i = 0; i <= 6; i++) {
        const dayMeals = dayMap.get(i) || [];
        days.push({
            dayOfWeek: i,
            meals: dayMeals,
            totalKcal: dayMeals.reduce((s, m) => s + m.totalKcal, 0),
            totalProtein: dayMeals.reduce((s, m) => s + m.items.reduce((si: number, it: any) => si + it.protein, 0), 0),
            totalCarbs: dayMeals.reduce((s, m) => s + m.items.reduce((si: number, it: any) => si + it.carbs, 0), 0),
            totalFat: dayMeals.reduce((s, m) => s + m.items.reduce((si: number, it: any) => si + it.fat, 0), 0),
        });
    }

    const p = plan as any;
    return {
        id: p.id,
        userId: p.user_id,
        weekStart: p.week_start,
        targetKcal: p.target_kcal,
        targetProtein: p.target_protein,
        targetCarbs: p.target_carbs,
        targetFat: p.target_fat,
        status: p.status,
        days,
        createdAt: p.created_at,
    };
}
