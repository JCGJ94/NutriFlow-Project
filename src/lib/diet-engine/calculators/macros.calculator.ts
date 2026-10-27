import { DailyTargets, MacroTargets } from '../types';

/**
 * Calculate macro targets based on calorie goal.
 * Split: Protein 30% / Carbs 40% / Fat 30%
 */
export function calculateMacros(targetKcal: number): DailyTargets {
    const macros: MacroTargets = {
        protein: Math.round((targetKcal * 0.30) / 4),
        carbs: Math.round((targetKcal * 0.40) / 4),
        fat: Math.round((targetKcal * 0.30) / 9),
        fiber: Math.round((targetKcal / 1000) * 14),
    };

    return { kcal: targetKcal, macros };
}

/**
 * Scale daily macro targets by a meal percentage.
 */
export function calculateMealMacros(dailyTargets: DailyTargets, percentage: number): DailyTargets {
    return {
        kcal: Math.round(dailyTargets.kcal * percentage),
        macros: {
            protein: Math.round(dailyTargets.macros.protein * percentage),
            carbs: Math.round(dailyTargets.macros.carbs * percentage),
            fat: Math.round(dailyTargets.macros.fat * percentage),
            fiber: Math.round(dailyTargets.macros.fiber * percentage),
        },
    };
}
