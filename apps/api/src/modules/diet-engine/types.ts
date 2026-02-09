import {
    Sex,
    ActivityLevel,
    DietPattern,
    MealType,
    DayOfWeek,
    IngredientCategory,
} from '@nutriflow/shared';

// ---- Input Types ----

export interface UserProfile {
    id: string;
    age: number;
    sex: Sex;
    weightKg: number;
    heightCm: number;
    activityLevel: ActivityLevel;
    mealsPerDay: number;
    dietPattern: DietPattern;
    weightGoalKg?: number;
    allergenIds: string[];
    language?: string;
    healthConditions?: string;
}

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
    bmr: number; // Basal Metabolic Rate
    tdee: number; // Total Daily Energy Expenditure
    targetKcal: number; // Target after goal adjustment
}

export interface MacroTargets {
    protein: number; // grams
    carbs: number; // grams
    fat: number; // grams
    fiber: number; // grams
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
    weekStart: string; // ISO date (Monday)
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
            categories: [
                IngredientCategory.DAIRY,
                IngredientCategory.FRUIT,
                IngredientCategory.GRAIN,
            ],
        },
        {
            mealType: MealType.LUNCH,
            kcalPercentage: 0.40,
            categories: [
                IngredientCategory.PROTEIN,
                IngredientCategory.CARBOHYDRATE,
                IngredientCategory.VEGETABLE,
            ],
        },
        {
            mealType: MealType.DINNER,
            kcalPercentage: 0.35,
            categories: [
                IngredientCategory.PROTEIN,
                IngredientCategory.VEGETABLE,
                IngredientCategory.FAT,
            ],
        },
    ],
    4: [
        {
            mealType: MealType.BREAKFAST,
            kcalPercentage: 0.25,
            categories: [
                IngredientCategory.DAIRY,
                IngredientCategory.FRUIT,
                IngredientCategory.GRAIN,
            ],
        },
        {
            mealType: MealType.LUNCH,
            kcalPercentage: 0.35,
            categories: [
                IngredientCategory.PROTEIN,
                IngredientCategory.CARBOHYDRATE,
                IngredientCategory.VEGETABLE,
            ],
        },
        {
            mealType: MealType.SNACK,
            kcalPercentage: 0.10,
            categories: [
                IngredientCategory.FRUIT,
                IngredientCategory.NUT_SEED,
            ],
        },
        {
            mealType: MealType.DINNER,
            kcalPercentage: 0.30,
            categories: [
                IngredientCategory.PROTEIN,
                IngredientCategory.VEGETABLE,
                IngredientCategory.FAT,
            ],
        },
    ],
    5: [
        {
            mealType: MealType.BREAKFAST,
            kcalPercentage: 0.20,
            categories: [
                IngredientCategory.DAIRY,
                IngredientCategory.FRUIT,
                IngredientCategory.GRAIN,
            ],
        },
        {
            mealType: MealType.SNACK,
            kcalPercentage: 0.10,
            categories: [IngredientCategory.FRUIT],
        },
        {
            mealType: MealType.LUNCH,
            kcalPercentage: 0.30,
            categories: [
                IngredientCategory.PROTEIN,
                IngredientCategory.CARBOHYDRATE,
                IngredientCategory.VEGETABLE,
            ],
        },
        {
            mealType: MealType.SNACK,
            kcalPercentage: 0.10,
            categories: [IngredientCategory.NUT_SEED],
        },
        {
            mealType: MealType.DINNER,
            kcalPercentage: 0.30,
            categories: [
                IngredientCategory.PROTEIN,
                IngredientCategory.VEGETABLE,
                IngredientCategory.FAT,
            ],
        },
    ],
};

// ---- Activity Multipliers ----

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
    [ActivityLevel.SEDENTARY]: 1.2,
    [ActivityLevel.LIGHTLY_ACTIVE]: 1.375,
    [ActivityLevel.MODERATELY_ACTIVE]: 1.55,
    [ActivityLevel.VERY_ACTIVE]: 1.725,
    [ActivityLevel.EXTREMELY_ACTIVE]: 1.9,
};

// Weight loss deficit (kcal per day for ~0.5kg/week loss)
export const WEIGHT_LOSS_DEFICIT = 500;

// Macro tolerance percentage (MVP: ±10%)
export const MACRO_TOLERANCE = 0.10;
