import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../config/supabase.module';
import { PlanStatus, DayOfWeek } from '@nutriflow/shared';
import { GeneratedWeekPlan } from '../diet-engine/types';
import { PlanResponseDto, PlanSummaryDto, DayResponseDto, MealResponseDto } from './dto';

@Injectable()
export class PlansRepository {
    constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) { }

    async create(userId: string, plan: GeneratedWeekPlan): Promise<PlanResponseDto> {
        // Create plan record
        const { data: planData, error: planError } = await this.supabase
            .from('plans')
            .insert({
                user_id: userId,
                week_start: plan.weekStart,
                target_kcal: plan.targetKcal,
                target_protein: plan.targetProtein,
                target_carbs: plan.targetCarbs,
                target_fat: plan.targetFat,
                status: PlanStatus.ACTIVE,
            })
            .select()
            .single();

        if (planError) {
            throw new Error(`Failed to create plan: ${planError.message}`);
        }

        // Create meals for each day
        for (const day of plan.days) {
            for (const meal of day.meals) {
                const { data: mealData, error: mealError } = await this.supabase
                    .from('plan_meals')
                    .insert({
                        plan_id: planData.id,
                        day_of_week: day.dayOfWeek,
                        meal_type: meal.mealType,
                        is_locked: false,
                        total_kcal: meal.totalKcal,
                    })
                    .select()
                    .single();

                if (mealError) {
                    throw new Error(`Failed to create meal: ${mealError.message}`);
                }

                // Create meal items
                if (meal.items.length > 0) {
                    const mealItems = meal.items.map((item) => ({
                        meal_id: mealData.id,
                        ingredient_id: item.ingredientId,
                        grams: item.grams,
                        kcal: item.kcal,
                        protein: item.protein,
                        carbs: item.carbs,
                        fat: item.fat,
                    }));

                    const { error: itemsError } = await this.supabase
                        .from('plan_meal_items')
                        .insert(mealItems);

                    if (itemsError) {
                        throw new Error(`Failed to create meal items: ${itemsError.message}`);
                    }
                }
            }
        }

        // Return full plan
        return this.findById(planData.id);
    }

    async findAllByUser(userId: string): Promise<PlanSummaryDto[]> {
        const { data, error } = await this.supabase
            .from('plans')
            .select('id, week_start, target_kcal, status, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch plans: ${error.message}`);
        }

        return (data || []).map((p) => ({
            id: p.id,
            weekStart: p.week_start,
            targetKcal: p.target_kcal,
            status: p.status,
            createdAt: new Date(p.created_at),
        }));
    }

    async findById(planId: string): Promise<PlanResponseDto> {
        // Get plan
        const { data: plan, error: planError } = await this.supabase
            .from('plans')
            .select('*')
            .eq('id', planId)
            .single();

        if (planError || !plan) {
            throw new Error('Plan not found');
        }

        // Get meals with items
        const { data: meals, error: mealsError } = await this.supabase
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
          ingredients (
            name
          )
        )
      `)
            .eq('plan_id', planId)
            .order('day_of_week')
            .order('meal_type');

        if (mealsError) {
            throw new Error(`Failed to fetch meals: ${mealsError.message}`);
        }

        // Group meals by day
        const dayMap = new Map<DayOfWeek, MealResponseDto[]>();

        for (const meal of meals || []) {
            const mealDto: MealResponseDto = {
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

            if (!dayMap.has(meal.day_of_week)) {
                dayMap.set(meal.day_of_week, []);
            }
            dayMap.get(meal.day_of_week)!.push(mealDto);
        }

        // Build days array
        const days: DayResponseDto[] = [];
        for (let i = 0; i <= 6; i++) {
            const dayMeals = dayMap.get(i as DayOfWeek) || [];
            days.push({
                dayOfWeek: i as DayOfWeek,
                meals: dayMeals,
                totalKcal: dayMeals.reduce((sum, m) => sum + m.totalKcal, 0),
                totalProtein: dayMeals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.protein, 0), 0),
                totalCarbs: dayMeals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.carbs, 0), 0),
                totalFat: dayMeals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.fat, 0), 0),
            });
        }

        return {
            id: plan.id,
            userId: plan.user_id,
            weekStart: plan.week_start,
            targetKcal: plan.target_kcal,
            targetProtein: plan.target_protein,
            targetCarbs: plan.target_carbs,
            targetFat: plan.target_fat,
            status: plan.status,
            days,
            createdAt: new Date(plan.created_at),
        };
    }

    async updateMealLock(mealId: string, isLocked: boolean): Promise<void> {
        const { error } = await this.supabase
            .from('plan_meals')
            .update({ is_locked: isLocked })
            .eq('id', mealId);

        if (error) {
            throw new Error(`Failed to update meal lock: ${error.message}`);
        }
    }

    async updateStatus(planId: string, status: PlanStatus): Promise<void> {
        const { error } = await this.supabase
            .from('plans')
            .update({ status })
            .eq('id', planId);

        if (error) {
            throw new Error(`Failed to update plan status: ${error.message}`);
        }
    }

    async delete(planId: string): Promise<void> {
        const { error } = await this.supabase
            .from('plans')
            .delete()
            .eq('id', planId);

        if (error) {
            throw new Error(`Failed to delete plan: ${error.message}`);
        }
    }
}
