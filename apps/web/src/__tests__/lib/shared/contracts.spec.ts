import { describe, it, expect } from 'vitest';
import {
    Sex,
    ActivityLevel,
    DietPattern,
    UpsertProfileSchema,
    ProfileResponseSchema,
    SetAllergensSchema,
    AllergensResponseSchema,
    CheckUsernameResponseSchema,
    ToggleShoppingItemSchema,
    AddShoppingItemSchema,
    ApiErrorSchema,
} from '@nutriflow/shared';

const validProfile = {
    age: 30,
    sex: Sex.MALE,
    weightKg: 75,
    heightCm: 180,
    activityLevel: ActivityLevel.MODERATELY_ACTIVE,
    mealsPerDay: 3,
    dietPattern: DietPattern.OMNIVORE,
    language: 'es',
};

describe('UpsertProfileSchema', () => {
    it('accepts a payload built from the shared lowercase enums', () => {
        const result = UpsertProfileSchema.safeParse(validProfile);
        expect(result.success).toBe(true);
    });

    it('accepts a partial update because every field is optional', () => {
        expect(UpsertProfileSchema.safeParse({}).success).toBe(true);
        expect(UpsertProfileSchema.safeParse({ weightKg: 70 }).success).toBe(true);
    });

    it('rejects uppercase enum values', () => {
        expect(UpsertProfileSchema.safeParse({ ...validProfile, sex: 'MALE' }).success).toBe(false);
        expect(
            UpsertProfileSchema.safeParse({ ...validProfile, activityLevel: 'MODERATELY_ACTIVE' })
                .success,
        ).toBe(false);
        expect(
            UpsertProfileSchema.safeParse({ ...validProfile, dietPattern: 'OMNIVORE' }).success,
        ).toBe(false);
    });

    it('rejects diet patterns that the database cannot store', () => {
        for (const value of ['keto', 'mediterranean', 'paleo']) {
            expect(
                UpsertProfileSchema.safeParse({ ...validProfile, dietPattern: value }).success,
            ).toBe(false);
        }
    });

    it('keeps the numeric bounds of the previous contract', () => {
        expect(UpsertProfileSchema.safeParse({ ...validProfile, age: 17 }).success).toBe(false);
        expect(UpsertProfileSchema.safeParse({ ...validProfile, age: 101 }).success).toBe(false);
        expect(UpsertProfileSchema.safeParse({ ...validProfile, mealsPerDay: 7 }).success).toBe(
            false,
        );
        expect(UpsertProfileSchema.safeParse({ ...validProfile, heightCm: 99 }).success).toBe(
            false,
        );
        expect(UpsertProfileSchema.safeParse({ ...validProfile, language: 'fr' }).success).toBe(
            false,
        );
    });
});

describe('ProfileResponseSchema', () => {
    it('parses the profile shape returned by GET and PUT /api/profile', () => {
        const result = ProfileResponseSchema.safeParse({
            id: 'user-1',
            username: null,
            ...validProfile,
            weightGoalKg: null,
            healthConditions: null,
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
        });
        expect(result.success).toBe(true);
    });
});

describe('allergen contracts', () => {
    it('SetAllergensSchema requires an array of allergen ids', () => {
        expect(SetAllergensSchema.safeParse({ allergenIds: ['a', 'b'] }).success).toBe(true);
        expect(SetAllergensSchema.safeParse({}).success).toBe(false);
        expect(SetAllergensSchema.safeParse({ allergenIds: 'a' }).success).toBe(false);
    });

    it('AllergensResponseSchema wraps the list in an allergens key', () => {
        const ok = AllergensResponseSchema.safeParse({
            allergens: [{ id: 'a1', name: 'Gluten', description: null }],
        });
        expect(ok.success).toBe(true);
        expect(AllergensResponseSchema.safeParse([{ id: 'a1', name: 'Gluten' }]).success).toBe(
            false,
        );
    });
});

describe('CheckUsernameResponseSchema', () => {
    it('is an object with an available flag, not a bare boolean', () => {
        expect(CheckUsernameResponseSchema.safeParse({ available: true }).success).toBe(true);
        expect(CheckUsernameResponseSchema.safeParse(true).success).toBe(false);
    });
});

describe('shopping-list contracts', () => {
    it('ToggleShoppingItemSchema identifies the item by id and carries the new state', () => {
        expect(
            ToggleShoppingItemSchema.safeParse({ itemId: 'item-1', isChecked: true }).success,
        ).toBe(true);
        expect(ToggleShoppingItemSchema.safeParse({ itemId: 'item-1' }).success).toBe(false);
        expect(ToggleShoppingItemSchema.safeParse({ isChecked: true }).success).toBe(false);
        expect(ToggleShoppingItemSchema.safeParse({ ingredientName: 'Rice' }).success).toBe(false);
    });

    it('AddShoppingItemSchema keeps the body the add handler accepts today', () => {
        expect(AddShoppingItemSchema.safeParse({ name: 'Oats', grams: 200 }).success).toBe(true);
        expect(AddShoppingItemSchema.safeParse({ name: '' }).success).toBe(false);
        expect(AddShoppingItemSchema.safeParse({ grams: 200 }).success).toBe(false);
    });
});

describe('ApiErrorSchema', () => {
    it('is { error: string } and tolerates additive validation details', () => {
        expect(ApiErrorSchema.safeParse({ error: 'Unauthorized' }).success).toBe(true);
        expect(
            ApiErrorSchema.safeParse({ error: 'Invalid input', details: [{ path: ['age'] }] })
                .success,
        ).toBe(true);
        expect(ApiErrorSchema.safeParse({ message: 'nope' }).success).toBe(false);
    });
});
