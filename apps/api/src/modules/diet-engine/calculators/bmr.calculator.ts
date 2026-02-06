import { Injectable } from '@nestjs/common';
import { Sex } from '@nutriflow/shared';
import {
    UserProfile,
    BmrResult,
    ACTIVITY_MULTIPLIERS,
    WEIGHT_LOSS_DEFICIT,
} from '../types';

@Injectable()
export class BmrCalculator {
    /**
     * Calculate BMR using Mifflin-St Jeor Equation (most accurate for modern populations)
     * Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
     * Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
     */
    calculateBmr(profile: UserProfile): BmrResult {
        let bmr: number;

        if (profile.sex === Sex.MALE) {
            bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5;
        } else {
            bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age - 161;
        }

        // Calculate TDEE (Total Daily Energy Expenditure)
        const activityMultiplier = ACTIVITY_MULTIPLIERS[profile.activityLevel];
        const tdee = Math.round(bmr * activityMultiplier);

        // Calculate target calories (for weight loss)
        let targetKcal = tdee;

        if (profile.weightGoalKg && profile.weightGoalKg < profile.weightKg) {
            // Weight loss goal: apply deficit
            targetKcal = tdee - WEIGHT_LOSS_DEFICIT;
        } else if (profile.weightGoalKg && profile.weightGoalKg > profile.weightKg) {
            // Weight gain goal: add surplus (not primary use case but supported)
            targetKcal = tdee + 300;
        }

        // Ensure minimum safe calories
        const minimumKcal = profile.sex === Sex.MALE ? 1500 : 1200;
        targetKcal = Math.max(targetKcal, minimumKcal);

        return {
            bmr: Math.round(bmr),
            tdee,
            targetKcal: Math.round(targetKcal),
        };
    }
}
