// ============================================
// NutriFlow Shared Enums
// ============================================

// ---- Enums ----

export enum Sex {
    MALE = 'male',
    FEMALE = 'female',
}

export enum ActivityLevel {
    SEDENTARY = 'sedentary', // Little or no exercise
    LIGHTLY_ACTIVE = 'lightly_active', // Light exercise 1-3 days/week
    MODERATELY_ACTIVE = 'moderately_active', // Moderate exercise 3-5 days/week
    VERY_ACTIVE = 'very_active', // Hard exercise 6-7 days/week
    EXTREMELY_ACTIVE = 'extremely_active', // Very hard exercise & physical job
}

export enum DietPattern {
    OMNIVORE = 'omnivore',
    VEGETARIAN = 'vegetarian',
    VEGAN = 'vegan',
    PESCATARIAN = 'pescatarian',
}

export enum MealType {
    BREAKFAST = 'breakfast',
    LUNCH = 'lunch',
    DINNER = 'dinner',
    SNACK = 'snack',
}

export enum DayOfWeek {
    MONDAY = 0,
    TUESDAY = 1,
    WEDNESDAY = 2,
    THURSDAY = 3,
    FRIDAY = 4,
    SATURDAY = 5,
    SUNDAY = 6,
}

export enum PlanStatus {
    ACTIVE = 'active',
    ARCHIVED = 'archived',
}

export enum IngredientCategory {
    PROTEIN = 'protein',
    CARBOHYDRATE = 'carbohydrate',
    VEGETABLE = 'vegetable',
    FRUIT = 'fruit',
    DAIRY = 'dairy',
    FAT = 'fat',
    LEGUME = 'legume',
    GRAIN = 'grain',
    NUT_SEED = 'nut_seed',
    CONDIMENT = 'condiment',
}
