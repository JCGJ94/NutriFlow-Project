import { describe, it, expect } from 'vitest';
import { calculateMacros, calculateMealMacros } from '../../../lib/diet-engine/calculators/macros.calculator';

describe('calculateMacros', () => {
    it('returns correct kcal from target', () => {
        const result = calculateMacros(2000);
        expect(result.kcal).toBe(2000);
    });

    it('distributes protein at 30% (4 kcal/g)', () => {
        const result = calculateMacros(2000);
        // 2000 * 0.30 / 4 = 150
        expect(result.macros.protein).toBe(150);
    });

    it('distributes carbs at 40% (4 kcal/g)', () => {
        const result = calculateMacros(2000);
        // 2000 * 0.40 / 4 = 200
        expect(result.macros.carbs).toBe(200);
    });

    it('distributes fat at 30% (9 kcal/g)', () => {
        const result = calculateMacros(2000);
        // 2000 * 0.30 / 9 ≈ 67
        expect(result.macros.fat).toBe(67);
    });

    it('calculates fiber at ~14g per 1000 kcal', () => {
        const result = calculateMacros(2000);
        // 2000 / 1000 * 14 = 28
        expect(result.macros.fiber).toBe(28);
    });
});

describe('calculateMealMacros', () => {
    it('scales daily targets by percentage', () => {
        const daily = calculateMacros(2000);
        const meal = calculateMealMacros(daily, 0.25);
        expect(meal.kcal).toBe(500);
        expect(meal.macros.protein).toBe(Math.round(150 * 0.25));
    });

    it('rounds results to whole numbers', () => {
        const daily = calculateMacros(2259);
        const meal = calculateMealMacros(daily, 0.25);
        expect(Number.isInteger(meal.kcal)).toBe(true);
        expect(Number.isInteger(meal.macros.protein)).toBe(true);
    });
});
