import { DayOfWeek } from '@/lib/contracts';
import { calculateBmr } from './calculators/bmr.calculator';
import { calculateMacros, calculateMealMacros } from './calculators/macros.calculator';
import { selectIngredientsForMeal } from './selectors/ingredient.selector';
import { filterByAllergens } from './rules/allergen.rule';
import { filterByDietPattern } from './rules/diet-pattern.rule';
import {
    UserProfile,
    IngredientData,
    GeneratedWeekPlan,
    GeneratedDayPlan,
    GeneratedMeal,
    GeneratedMealItem,
    MealDistribution,
    DEFAULT_MEAL_DISTRIBUTIONS,
} from './types';

export * from './types';
export * from './calculators/bmr.calculator';
export * from './calculators/macros.calculator';
export * from './rules/allergen.rule';
export * from './rules/diet-pattern.rule';
export * from './selectors/ingredient.selector';

/**
 * Generate a complete weekly meal plan for a user.
 * Pure function — no side effects, no DI.
 */
export function generateWeeklyPlan(
    profile: UserProfile,
    availableIngredients: IngredientData[],
    weekStart: string,
): GeneratedWeekPlan {
    const bmrResult = calculateBmr(profile);
    const dailyTargets = calculateMacros(bmrResult.targetKcal);

    let compatibleIngredients = filterByAllergens(availableIngredients, profile.allergenIds);
    compatibleIngredients = filterByDietPattern(compatibleIngredients, profile.dietPattern);

    const mealDistributions = getMealDistributions(profile.mealsPerDay);

    const days: GeneratedDayPlan[] = [];
    for (let day = 0; day < 7; day++) {
        const dayPlan = generateDayPlan(
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
 * Regenerate a single meal within a day.
 */
export function regenerateMeal(
    profile: UserProfile,
    availableIngredients: IngredientData[],
    dayOfWeek: DayOfWeek,
    mealDistribution: MealDistribution,
    excludeIngredientIds: string[] = [],
): GeneratedMeal {
    const bmrResult = calculateBmr(profile);
    const dailyTargets = calculateMacros(bmrResult.targetKcal);

    let compatibleIngredients = filterByAllergens(availableIngredients, profile.allergenIds);
    compatibleIngredients = filterByDietPattern(compatibleIngredients, profile.dietPattern);
    compatibleIngredients = compatibleIngredients.filter((i) => !excludeIngredientIds.includes(i.id));

    const mealTarget = calculateMealMacros(dailyTargets, mealDistribution.kcalPercentage);
    const items = selectIngredientsForMeal(compatibleIngredients, mealDistribution.categories, mealTarget, new Set());

    return buildMeal(dayOfWeek, mealDistribution.mealType, items);
}

function generateDayPlan(
    dayOfWeek: DayOfWeek,
    dailyTargets: ReturnType<typeof calculateMacros>,
    mealDistributions: MealDistribution[],
    availableIngredients: IngredientData[],
): GeneratedDayPlan {
    const meals: GeneratedMeal[] = [];
    const usedIngredientIds = new Set<string>();

    for (const distribution of mealDistributions) {
        const mealTarget = calculateMealMacros(dailyTargets, distribution.kcalPercentage);
        const items = selectIngredientsForMeal(
            availableIngredients,
            distribution.categories,
            mealTarget,
            usedIngredientIds,
        );

        items.forEach((item) => usedIngredientIds.add(item.ingredientId));
        meals.push(buildMeal(dayOfWeek, distribution.mealType, items));
    }

    return {
        dayOfWeek,
        meals,
        totalKcal: meals.reduce((s, m) => s + m.totalKcal, 0),
        totalProtein: meals.reduce((s, m) => s + m.totalProtein, 0),
        totalCarbs: meals.reduce((s, m) => s + m.totalCarbs, 0),
        totalFat: meals.reduce((s, m) => s + m.totalFat, 0),
    };
}

function buildMeal(dayOfWeek: DayOfWeek, mealType: any, items: GeneratedMealItem[]): GeneratedMeal {
    return {
        dayOfWeek,
        mealType,
        items,
        totalKcal: items.reduce((s, i) => s + i.kcal, 0),
        totalProtein: items.reduce((s, i) => s + i.protein, 0),
        totalCarbs: items.reduce((s, i) => s + i.carbs, 0),
        totalFat: items.reduce((s, i) => s + i.fat, 0),
    };
}

function getMealDistributions(mealsPerDay: number): MealDistribution[] {
    return DEFAULT_MEAL_DISTRIBUTIONS[mealsPerDay] || DEFAULT_MEAL_DISTRIBUTIONS[3];
}
