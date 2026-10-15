// ============================================
// NutriFlow API contracts (Zod)
// Single executable source of truth for request/response shapes.
// Route handlers and clients import these instead of redefining shapes.
// ============================================

import { z } from 'zod';
import { Sex, ActivityLevel, DietPattern } from './enums';

// ---- Enum schemas (derived from the shared enums, never re-typed) ----

export const SexSchema = z.nativeEnum(Sex);
export const ActivityLevelSchema = z.nativeEnum(ActivityLevel);
export const DietPatternSchema = z.nativeEnum(DietPattern);
export const LanguageSchema = z.enum(['es', 'en']);

// ---- Profile ----

export const UpsertProfileSchema = z.object({
    username: z.string().optional(),
    age: z.number().int().min(18).max(100).optional(),
    sex: SexSchema.optional(),
    weightKg: z.number().min(30).max(300).optional(),
    heightCm: z.number().int().min(100).max(250).optional(),
    activityLevel: ActivityLevelSchema.optional(),
    mealsPerDay: z.number().int().min(2).max(6).optional(),
    dietPattern: DietPatternSchema.optional(),
    weightGoalKg: z.number().min(30).max(300).optional(),
    language: LanguageSchema.optional(),
    healthConditions: z.string().optional(),
});
export type UpsertProfile = z.infer<typeof UpsertProfileSchema>;

export const ProfileResponseSchema = z.object({
    id: z.string(),
    username: z.string().nullable().optional(),
    age: z.number(),
    sex: SexSchema,
    weightKg: z.number(),
    heightCm: z.number(),
    activityLevel: ActivityLevelSchema,
    mealsPerDay: z.number(),
    dietPattern: DietPatternSchema,
    weightGoalKg: z.number().nullable().optional(),
    language: LanguageSchema.nullable().optional(),
    healthConditions: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;

export const CheckUsernameResponseSchema = z.object({ available: z.boolean() });
export type CheckUsernameResponse = z.infer<typeof CheckUsernameResponseSchema>;

// ---- Allergens ----

export const AllergenSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable().optional(),
});
export type Allergen = z.infer<typeof AllergenSchema>;

export const AllergensResponseSchema = z.object({ allergens: z.array(AllergenSchema) });
export type AllergensResponse = z.infer<typeof AllergensResponseSchema>;

export const SetAllergensSchema = z.object({ allergenIds: z.array(z.string()) });
export type SetAllergens = z.infer<typeof SetAllergensSchema>;

// ---- Shopping list ----

export const ToggleShoppingItemSchema = z.object({
    itemId: z.string().min(1, 'itemId is required'),
    isChecked: z.boolean(),
});
export type ToggleShoppingItem = z.infer<typeof ToggleShoppingItemSchema>;

export const AddShoppingItemSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    quantity: z.string().optional(),
    ingredientId: z.string().optional(),
    grams: z.number().optional(),
});
export type AddShoppingItem = z.infer<typeof AddShoppingItemSchema>;

// ---- Error envelope ----

// `details` is additive: validation failures include the Zod issues.
export const ApiErrorSchema = z.object({
    error: z.string(),
    details: z.unknown().optional(),
});
export type ApiErrorBody = z.infer<typeof ApiErrorSchema>;
