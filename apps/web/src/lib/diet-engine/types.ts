import {
    ActivityLevel,
    MealType,
    DayOfWeek,
    IngredientCategory,
} from '@nutriflow/shared';
import type { ProfileResponse } from '@nutriflow/shared';

// ---- Input Types ----

// The nutrition-relevant fields come from the shared profile contract so the
// engine can never drift from what the API validates and persists.
export type UserProfile = Pick<
    ProfileResponse,
    'id' | 'age' | 'sex' | 'weightKg' | 'heightCm' | 'activityLevel' | 'mealsPerDay' | 'dietPattern'
> & {
    weightGoalKg?: number;
    allergenIds: string[];
    language?: string;
    healthConditions?: string;
};

export interface IngredientData {
    id: string;
    name: string;
    category: IngredientCategory;
    kcalPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    fiberPer100g: number;
    isVegan: boolean;
    isVegetarian: boolean;
    allergenIds: string[];
}

// ---- Calculation Results ----

export interface BmrResult {
    bmr: number;
    tdee: number;
    targetKcal: number;
}

export interface MacroTargets {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
}

export interface DailyTargets {
    kcal: number;
    macros: MacroTargets;
}

// ---- Plan Generation ----

export interface GeneratedMealItem {
    ingredientId: string;
    ingredientName: string;
    grams: number;
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface GeneratedMeal {
    dayOfWeek: DayOfWeek;
    mealType: MealType;
    items: GeneratedMealItem[];
    totalKcal: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
}

export interface GeneratedDayPlan {
    dayOfWeek: DayOfWeek;
    meals: GeneratedMeal[];
    totalKcal: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
}

export interface GeneratedWeekPlan {
    weekStart: string;
    days: GeneratedDayPlan[];
    targetKcal: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
}

// ---- Configuration ----

export interface MealDistribution {
    mealType: MealType;
    kcalPercentage: number;
    categories: IngredientCategory[];
}

export const DEFAULT_MEAL_DISTRIBUTIONS: Record<number, MealDistribution[]> = {
    3: [
        {
            mealType: MealType.BREAKFAST,
            kcalPercentage: 0.25,
            categories: [IngredientCategory.DAIRY, IngredientCategory.FRUIT, IngredientCategory.GRAIN],
        },
        {
            mealType: MealType.LUNCH,
            kcalPercentage: 0.40,
            categories: [IngredientCategory.PROTEIN, IngredientCategory.CARBOHYDRATE, IngredientCategory.VEGETABLE],
        },
        {
            mealType: MealType.DINNER,
            kcalPercentage: 0.35,
            categories: [IngredientCategory.PROTEIN, IngredientCategory.VEGETABLE, IngredientCategory.FAT],
        },
    ],
    4: [
        {
            mealType: MealType.BREAKFAST,
            kcalPercentage: 0.25,
            categories: [IngredientCategory.DAIRY, IngredientCategory.FRUIT, IngredientCategory.GRAIN],
        },
        {
            mealType: MealType.LUNCH,
            kcalPercentage: 0.35,
            categories: [IngredientCategory.PROTEIN, IngredientCategory.CARBOHYDRATE, IngredientCategory.VEGETABLE],
        },
        {
            mealType: MealType.SNACK,
            kcalPercentage: 0.10,
            categories: [IngredientCategory.FRUIT, IngredientCategory.NUT_SEED],
        },
        {
            mealType: MealType.DINNER,
            kcalPercentage: 0.30,
            categories: [IngredientCategory.PROTEIN, IngredientCategory.VEGETABLE, IngredientCategory.FAT],
        },
    ],
    5: [
        {
            mealType: MealType.BREAKFAST,
            kcalPercentage: 0.20,
            categories: [IngredientCategory.DAIRY, IngredientCategory.FRUIT, IngredientCategory.GRAIN],
        },
        {
            mealType: MealType.SNACK,
            kcalPercentage: 0.10,
            categories: [IngredientCategory.FRUIT],
        },
        {
            mealType: MealType.LUNCH,
            kcalPercentage: 0.30,
            categories: [IngredientCategory.PROTEIN, IngredientCategory.CARBOHYDRATE, IngredientCategory.VEGETABLE],
        },
        {
            mealType: MealType.SNACK,
            kcalPercentage: 0.10,
            categories: [IngredientCategory.NUT_SEED],
        },
        {
            mealType: MealType.DINNER,
            kcalPercentage: 0.30,
            categories: [IngredientCategory.PROTEIN, IngredientCategory.VEGETABLE, IngredientCategory.FAT],
        },
    ],
};

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
    [ActivityLevel.SEDENTARY]: 1.2,
    [ActivityLevel.LIGHTLY_ACTIVE]: 1.375,
    [ActivityLevel.MODERATELY_ACTIVE]: 1.55,
    [ActivityLevel.VERY_ACTIVE]: 1.725,
    [ActivityLevel.EXTREMELY_ACTIVE]: 1.9,
};

export const WEIGHT_LOSS_DEFICIT = 500;
export const MACRO_TOLERANCE = 0.10;
