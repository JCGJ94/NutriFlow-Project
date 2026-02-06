// ============================================
// NutriFlow Shared Types & Enums
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

// ---- Interfaces ----

export interface MacroNutrients {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
}

export interface Profile {
    id: string;
    age: number;
    sex: Sex;
    weightKg: number;
    heightCm: number;
    activityLevel: ActivityLevel;
    mealsPerDay: number;
    dietPattern: DietPattern;
    weightGoalKg?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Allergen {
    id: string;
    name: string;
    description?: string;
}

export interface Ingredient {
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
    allergenIds?: string[];
}

export interface MealItem {
    id: string;
    mealId: string;
    ingredientId: string;
    ingredient?: Ingredient;
    grams: number;
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface Meal {
    id: string;
    planId: string;
    dayOfWeek: DayOfWeek;
    mealType: MealType;
    isLocked: boolean;
    totalKcal: number;
    items: MealItem[];
}

export interface Plan {
    id: string;
    userId: string;
    weekStart: string; // ISO date string (Monday)
    targetKcal: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
    status: PlanStatus;
    meals: Meal[];
    createdAt: Date;
}

export interface ShoppingListItem {
    ingredientId: string;
    ingredientName: string;
    totalGrams: number;
    category: IngredientCategory;
}

export interface ShoppingList {
    planId: string;
    items: ShoppingListItem[];
    generatedAt: Date;
}

export interface WeightLog {
    id: string;
    userId: string;
    weightKg: number;
    loggedAt: Date;
}

// ---- API DTOs ----

export interface UpsertProfileDto {
    age: number;
    sex: Sex;
    weightKg: number;
    heightCm: number;
    activityLevel: ActivityLevel;
    mealsPerDay?: number;
    dietPattern?: DietPattern;
    weightGoalKg?: number;
}

export interface SetAllergensDto {
    allergenIds: string[];
}

export interface GenerateWeeklyPlanDto {
    weekStart?: string; // ISO date, defaults to next Monday
}

export interface RegenerateMealDto {
    mealId: string;
}

export interface RegenerateDayDto {
    dayOfWeek: DayOfWeek;
}

export interface SetMealLockDto {
    mealId: string;
    isLocked: boolean;
}

// ---- API Responses ----

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// ---- AI Diet Generation Types ----

export interface GeneratedMealItem {
    ingredientName: string; // Simplified for AI response
    grams: number;
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface GeneratedMeal {
    mealType: string;
    totalKcal: number;
    items: GeneratedMealItem[];
}

export interface GeneratedDayPlan {
    dayOfWeek: number;
    totalKcal: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    meals: GeneratedMeal[];
}

export interface GeneratedWeekPlan {
    weekStart: string;
    days: GeneratedDayPlan[];
    targetKcal: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
}

// ============================================
// Exercise Module Types
// ============================================

export enum ExerciseType {
    STRENGTH = 'strength',
    CARDIO = 'cardio',
    FLEXIBILITY = 'flexibility',
    HIIT = 'hiit',
    REST = 'rest',
}

export enum MuscleGroup {
    CHEST = 'chest',
    BACK = 'back',
    SHOULDERS = 'shoulders',
    BICEPS = 'biceps',
    TRICEPS = 'triceps',
    LEGS = 'legs',
    GLUTES = 'glutes',
    CORE = 'core',
    FULL_BODY = 'full_body',
    CARDIO = 'cardio',
}

export enum ExerciseDifficulty {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
}

export interface Exercise {
    id: string;
    name: string;
    description?: string;
    type: ExerciseType;
    muscleGroup: MuscleGroup;
    difficulty: ExerciseDifficulty;
    equipment?: string;
    videoUrl?: string;
    imageUrl?: string;
}

export interface ExerciseSet {
    id: string;
    exerciseId: string;
    exercise?: Exercise;
    sets: number;
    reps?: number;        // For strength exercises
    durationSec?: number; // For cardio/timed exercises
    restSec: number;
    notes?: string;
}

export interface WorkoutDay {
    id: string;
    planId: string;
    dayOfWeek: DayOfWeek;
    name: string;          // e.g., "Push Day", "Cardio", "Rest"
    type: ExerciseType;
    exercises: ExerciseSet[];
    totalDurationMin: number;
    caloriesBurned: number;
    isRestDay: boolean;
}

export interface ExercisePlan {
    id: string;
    userId: string;
    weekStart: string;
    goal: ExerciseGoal;
    daysPerWeek: number;
    workoutDays: WorkoutDay[];
    createdAt: Date;
}

export enum ExerciseGoal {
    LOSE_WEIGHT = 'lose_weight',
    BUILD_MUSCLE = 'build_muscle',
    MAINTAIN = 'maintain',
    IMPROVE_ENDURANCE = 'improve_endurance',
    FLEXIBILITY = 'flexibility',
}

// ---- Generated Exercise Plan (for AI/Rules Engine) ----

export interface GeneratedExerciseSet {
    exerciseName: string;
    sets: number;
    reps?: number;
    durationSec?: number;
    restSec: number;
}

export interface GeneratedWorkoutDay {
    dayOfWeek: number;
    name: string;
    type: string;
    isRestDay: boolean;
    exercises: GeneratedExerciseSet[];
    totalDurationMin: number;
    caloriesBurned: number;
}

export interface GeneratedExercisePlan {
    weekStart: string;
    goal: string;
    daysPerWeek: number;
    workoutDays: GeneratedWorkoutDay[];
}

// ---- Combined Plan View ----

export interface CombinedWeeklyPlan {
    dietPlan: GeneratedWeekPlan;
    exercisePlan: GeneratedExercisePlan;
}
