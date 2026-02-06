import { Test, TestingModule } from '@nestjs/testing';
import { BmrCalculator } from './bmr.calculator';
import { Sex, ActivityLevel, DietPattern } from '@nutriflow/shared';
import { UserProfile } from '../types';

describe('BmrCalculator', () => {
    let calculator: BmrCalculator;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [BmrCalculator],
        }).compile();

        calculator = module.get<BmrCalculator>(BmrCalculator);
    });

    const baseProfile: UserProfile = {
        age: 30,
        sex: Sex.MALE,
        weightKg: 80,
        heightCm: 180,
        activityLevel: ActivityLevel.MODERATELY_ACTIVE,
        mealsPerDay: 4,
        dietPattern: DietPattern.OMNIVORE,
        allergenIds: [],
        weightGoalKg: 75, // Loss goal
    };

    it('should calculate BMR correctly for men', () => {
        // Mifflin-St Jeor: (10 * 80) + (6.25 * 180) - (5 * 30) + 5
        // 800 + 1125 - 150 + 5 = 1780
        const result = calculator.calculateBmr(baseProfile);
        expect(result.bmr).toBe(1780);
    });

    it('should calculate BMR correctly for women', () => {
        const femaleProfile = { ...baseProfile, sex: Sex.FEMALE, weightKg: 60, heightCm: 165 };
        // Mifflin-St Jeor: (10 * 60) + (6.25 * 165) - (5 * 30) - 161
        // 600 + 1031.25 - 150 - 161 = 1320.25 -> round 1320
        const result = calculator.calculateBmr(femaleProfile);
        expect(result.bmr).toBe(1320);
    });

    it('should apply activity multiplier and deficit', () => {
        // BMR 1780
        // TDEE = 1780 * 1.55 (Moderate) = 2759
        // Target = 2759 - 500 = 2259
        const result = calculator.calculateBmr(baseProfile);
        expect(result.tdee).toBe(2759);
        expect(result.targetKcal).toBe(2259);
    });

    it('should enforce minimum calories (safety floor)', () => {
        // Very small person trying to lose weight
        const smallProfile = {
            ...baseProfile,
            sex: Sex.FEMALE,
            weightKg: 45,
            heightCm: 150,
            age: 25,
            activityLevel: ActivityLevel.SEDENTARY,
            weightGoalKg: 40
        };
        // BMR approx: 450 + 937.5 - 125 - 161 = 1101.5
        // TDEE: 1101.5 * 1.2 = 1321.8
        // Target: 1321.8 - 500 = 821.8 => Should floor to 1200

        const result = calculator.calculateBmr(smallProfile);
        expect(result.targetKcal).toBe(1200);
    });
});
