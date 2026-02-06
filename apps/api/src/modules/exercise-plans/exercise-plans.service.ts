import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfilesService } from '../profiles/profiles.service';
import { ExerciseEngineService } from '../exercise-engine/exercise-engine.service';
import { GeneratedExercisePlan, ExerciseGoal, ActivityLevel } from '@nutriflow/shared';

// In-memory cache for exercise plans (linked to diet plans)
// In production, this would be stored in Supabase
const exercisePlansCache = new Map<string, GeneratedExercisePlan>();

@Injectable()
export class ExercisePlansService {
    constructor(
        private readonly profilesService: ProfilesService,
        private readonly exerciseEngineService: ExerciseEngineService,
    ) { }

    async generateExercisePlan(userId: string): Promise<GeneratedExercisePlan> {
        const profile = await this.profilesService.getProfile(userId);

        if (!profile) {
            throw new NotFoundException('Perfil no encontrado. Crea tu perfil primero.');
        }

        // Determine exercise goal based on weight goal
        const goal = this.determineGoal(profile);

        const exerciseProfile = {
            activityLevel: profile.activityLevel as ActivityLevel,
            goal,
            age: profile.age,
            sex: profile.sex,
        };

        const weekStart = this.getNextMonday();
        const plan = this.exerciseEngineService.generateExercisePlan(exerciseProfile, weekStart);

        return plan;
    }

    async getOrGenerateForDietPlan(userId: string, dietPlanId: string): Promise<GeneratedExercisePlan> {
        // Check cache first
        const cacheKey = `${userId}_${dietPlanId}`;
        if (exercisePlansCache.has(cacheKey)) {
            return exercisePlansCache.get(cacheKey)!;
        }

        // Generate new plan
        const plan = await this.generateExercisePlan(userId);

        // Cache it
        exercisePlansCache.set(cacheKey, plan);

        return plan;
    }

    async getAllForUser(userId: string): Promise<GeneratedExercisePlan[]> {
        const plans: GeneratedExercisePlan[] = [];

        for (const [key, plan] of exercisePlansCache.entries()) {
            if (key.startsWith(userId)) {
                plans.push(plan);
            }
        }

        // If no cached plans, generate a new one
        if (plans.length === 0) {
            const newPlan = await this.generateExercisePlan(userId);
            plans.push(newPlan);
        }

        return plans;
    }

    private determineGoal(profile: { weightKg: number; weightGoalKg?: number }): ExerciseGoal {
        if (!profile.weightGoalKg) {
            return ExerciseGoal.MAINTAIN;
        }

        const diff = profile.weightGoalKg - profile.weightKg;

        if (diff < -2) {
            return ExerciseGoal.LOSE_WEIGHT;
        } else if (diff > 2) {
            return ExerciseGoal.BUILD_MUSCLE;
        } else {
            return ExerciseGoal.MAINTAIN;
        }
    }

    private getNextMonday(): string {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7;
        const nextMonday = new Date(now);
        nextMonday.setDate(now.getDate() + daysUntilMonday);
        return nextMonday.toISOString().split('T')[0];
    }
}
