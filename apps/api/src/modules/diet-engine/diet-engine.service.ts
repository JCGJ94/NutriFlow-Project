import { Injectable } from '@nestjs/common';
import { DayOfWeek } from '@nutriflow/shared';
import { BmrCalculator } from './calculators/bmr.calculator';
import { MacrosCalculator } from './calculators/macros.calculator';
import { IngredientSelector } from './selectors/ingredient.selector';
import { AllergenRule } from './rules/allergen.rule';
import { DietPatternRule } from './rules/diet-pattern.rule';
import {
    UserProfile,
    IngredientData,
    GeneratedWeekPlan,
    GeneratedDayPlan,
    GeneratedMeal,
    DEFAULT_MEAL_DISTRIBUTIONS,
    MealDistribution,
} from './types';

@Injectable()
export class DietEngineService {
    constructor(
        private readonly bmrCalculator: BmrCalculator,
        private readonly macrosCalculator: MacrosCalculator,
        private readonly ingredientSelector: IngredientSelector,
        private readonly allergenRule: AllergenRule,
        private readonly dietPatternRule: DietPatternRule,
    ) { }

    /**
     * Generate a complete weekly meal plan for a user
     */
    generateWeeklyPlan(
        profile: UserProfile,
        availableIngredients: IngredientData[],
        weekStart: string,
    ): GeneratedWeekPlan {
        // Step 1: Calculate calorie needs
        const bmrResult = this.bmrCalculator.calculateBmr(profile);

        // Step 2: Calculate macro targets
        const dailyTargets = this.macrosCalculator.calculateMacros(bmrResult.targetKcal);

        // Step 3: Filter ingredients by restrictions
        let compatibleIngredients = this.allergenRule.filterByAllergens(
            availableIngredients,
            profile.allergenIds,
        );
        compatibleIngredients = this.dietPatternRule.filterByDietPattern(
            compatibleIngredients,
            profile.dietPattern,
        );

        // Step 4: Get meal distribution based on meals per day
        const mealDistributions = this.getMealDistributions(profile.mealsPerDay);

        // Step 5: Generate each day
        const days: GeneratedDayPlan[] = [];
        for (let day = 0; day < 7; day++) {
            const dayPlan = this.generateDayPlan(
                day as DayOfWeek,
                dailyTargets,
                mealDistributions,
                compatibleIngredients,
            );
            days.push(dayPlan);
        }

        return {
            weekStart,
            days,
            targetKcal: dailyTargets.kcal,
            targetProtein: dailyTargets.macros.protein,
            targetCarbs: dailyTargets.macros.carbs,
            targetFat: dailyTargets.macros.fat,
        };
    }

    /**
     * Regenerate a single meal within a day
     */
    regenerateMeal(
        profile: UserProfile,
        availableIngredients: IngredientData[],
        dayOfWeek: DayOfWeek,
        mealDistribution: MealDistribution,
        excludeIngredientIds: string[] = [],
    ): GeneratedMeal {
        const bmrResult = this.bmrCalculator.calculateBmr(profile);
        const dailyTargets = this.macrosCalculator.calculateMacros(bmrResult.targetKcal);

        let compatibleIngredients = this.allergenRule.filterByAllergens(
            availableIngredients,
            profile.allergenIds,
        );
        compatibleIngredients = this.dietPatternRule.filterByDietPattern(
            compatibleIngredients,
            profile.dietPattern,
        );

        // Exclude already used ingredients
        compatibleIngredients = compatibleIngredients.filter(
            (i) => !excludeIngredientIds.includes(i.id),
        );

        const mealTarget = this.macrosCalculator.calculateMealMacros(
            dailyTargets,
            mealDistribution.kcalPercentage,
        );

        const items = this.ingredientSelector.selectIngredientsForMeal(
            compatibleIngredients,
            mealDistribution.categories,
            mealTarget,
            new Set(),
        );

        return {
            dayOfWeek,
            mealType: mealDistribution.mealType,
            items,
            totalKcal: items.reduce((sum, i) => sum + i.kcal, 0),
            totalProtein: items.reduce((sum, i) => sum + i.protein, 0),
            totalCarbs: items.reduce((sum, i) => sum + i.carbs, 0),
            totalFat: items.reduce((sum, i) => sum + i.fat, 0),
        };
    }

    /**
     * Generate meals for a single day
     */
    private generateDayPlan(
        dayOfWeek: DayOfWeek,
        dailyTargets: { kcal: number; macros: { protein: number; carbs: number; fat: number; fiber: number } },
        mealDistributions: MealDistribution[],
        availableIngredients: IngredientData[],
    ): GeneratedDayPlan {
        const meals: GeneratedMeal[] = [];
        const usedIngredientIds = new Set<string>();

        for (const distribution of mealDistributions) {
            const mealTarget = this.macrosCalculator.calculateMealMacros(
                dailyTargets,
                distribution.kcalPercentage,
            );

            const items = this.ingredientSelector.selectIngredientsForMeal(
                availableIngredients,
                distribution.categories,
                mealTarget,
                usedIngredientIds,
            );

            // Track used ingredients to avoid repetition within the day
            items.forEach((item) => usedIngredientIds.add(item.ingredientId));

            const meal: GeneratedMeal = {
                dayOfWeek,
                mealType: distribution.mealType,
                items,
                totalKcal: items.reduce((sum, i) => sum + i.kcal, 0),
                totalProtein: items.reduce((sum, i) => sum + i.protein, 0),
                totalCarbs: items.reduce((sum, i) => sum + i.carbs, 0),
                totalFat: items.reduce((sum, i) => sum + i.fat, 0),
            };

            meals.push(meal);
        }

        return {
            dayOfWeek,
            meals,
            totalKcal: meals.reduce((sum, m) => sum + m.totalKcal, 0),
            totalProtein: meals.reduce((sum, m) => sum + m.totalProtein, 0),
            totalCarbs: meals.reduce((sum, m) => sum + m.totalCarbs, 0),
            totalFat: meals.reduce((sum, m) => sum + m.totalFat, 0),
        };
    }

    /**
     * Get meal distributions based on meals per day
     */
    private getMealDistributions(mealsPerDay: number): MealDistribution[] {
        return DEFAULT_MEAL_DISTRIBUTIONS[mealsPerDay] || DEFAULT_MEAL_DISTRIBUTIONS[3];
    }
}
