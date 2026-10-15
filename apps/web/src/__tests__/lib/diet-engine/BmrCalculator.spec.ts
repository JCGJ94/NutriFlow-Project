import { describe, it, expect } from 'vitest';
import { calculateBmr } from '../../../lib/diet-engine/calculators/bmr.calculator';
import { Sex, ActivityLevel, DietPattern } from '@nutriflow/shared';
import type { UserProfile } from '../../../lib/diet-engine/types';

const baseProfile: UserProfile = {
    id: 'test-1',
    age: 30,
    sex: Sex.MALE,
    weightKg: 80,
    heightCm: 180,
    activityLevel: ActivityLevel.MODERATELY_ACTIVE,
    mealsPerDay: 4,
    dietPattern: DietPattern.OMNIVORE,
    allergenIds: [],
    weightGoalKg: 75, // loss goal
};

describe('calculateBmr', () => {
    it('calculates BMR correctly for a male', () => {
        // Mifflin-St Jeor: (10 * 80) + (6.25 * 180) - (5 * 30) + 5 = 1780
        const result = calculateBmr(baseProfile);
        expect(result.bmr).toBe(1780);
    });

    it('calculates BMR correctly for a female', () => {
        const femaleProfile: UserProfile = { ...baseProfile, sex: Sex.FEMALE, weightKg: 60, heightCm: 165 };
        // (10 * 60) + (6.25 * 165) - (5 * 30) - 161 = 600 + 1031.25 - 150 - 161 = 1320.25 -> 1320
        const result = calculateBmr(femaleProfile);
        expect(result.bmr).toBe(1320);
    });

    it('applies activity multiplier and weight loss deficit', () => {
        // TDEE = 1780 * 1.55 = 2759; Target = 2759 - 500 = 2259
        const result = calculateBmr(baseProfile);
        expect(result.tdee).toBe(2759);
        expect(result.targetKcal).toBe(2259);
    });

    it('enforces minimum calories for female (1200 kcal floor)', () => {
        const smallProfile: UserProfile = {
            ...baseProfile,
            sex: Sex.FEMALE,
            weightKg: 45,
            heightCm: 150,
            age: 25,
            activityLevel: ActivityLevel.SEDENTARY,
            weightGoalKg: 40,
        };
        const result = calculateBmr(smallProfile);
        expect(result.targetKcal).toBe(1200);
    });

    it('enforces minimum calories for male (1500 kcal floor)', () => {
        const tinyProfile: UserProfile = {
            ...baseProfile,
            sex: Sex.MALE,
            weightKg: 50,
            heightCm: 155,
            age: 60,
            activityLevel: ActivityLevel.SEDENTARY,
            weightGoalKg: 40,
        };
        const result = calculateBmr(tinyProfile);
        expect(result.targetKcal).toBeGreaterThanOrEqual(1500);
    });

    it('adds surplus for weight gain goal', () => {
        const gainProfile: UserProfile = { ...baseProfile, weightGoalKg: 90 };
        const result = calculateBmr(gainProfile);
        expect(result.targetKcal).toBeGreaterThan(result.tdee);
    });
});
