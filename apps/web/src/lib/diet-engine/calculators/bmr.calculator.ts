import { Sex } from '@nutriflow/shared';
import { UserProfile, BmrResult, ACTIVITY_MULTIPLIERS, WEIGHT_LOSS_DEFICIT } from '../types';

/**
 * Calculate BMR using Mifflin-St Jeor Equation
 * Men:   BMR = 10w + 6.25h - 5a + 5
 * Women: BMR = 10w + 6.25h - 5a - 161
 */
export function calculateBmr(profile: UserProfile): BmrResult {
    let bmr: number;

    if (profile.sex === Sex.MALE) {
        bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5;
    } else {
        bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age - 161;
    }

    const activityMultiplier = ACTIVITY_MULTIPLIERS[profile.activityLevel];
    const tdee = Math.round(bmr * activityMultiplier);

    let targetKcal = tdee;

    if (profile.weightGoalKg && profile.weightGoalKg < profile.weightKg) {
        targetKcal = tdee - WEIGHT_LOSS_DEFICIT;
    } else if (profile.weightGoalKg && profile.weightGoalKg > profile.weightKg) {
        targetKcal = tdee + 300;
    }

    const minimumKcal = profile.sex === Sex.MALE ? 1500 : 1200;
    targetKcal = Math.max(targetKcal, minimumKcal);

    return {
        bmr: Math.round(bmr),
        tdee,
        targetKcal: Math.round(targetKcal),
    };
}
