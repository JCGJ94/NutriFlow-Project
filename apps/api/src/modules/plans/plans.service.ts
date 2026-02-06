import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DayOfWeek, PlanStatus } from '@nutriflow/shared';
import { PlansRepository } from './plans.repository';
import { ProfilesService } from '../profiles/profiles.service';
import { IngredientsService } from '../ingredients/ingredients.service';
import { DietEngineService } from '../diet-engine/diet-engine.service';
import { ExercisePlansService } from '../exercise-plans/exercise-plans.service';
import { AiDietService } from '../diet-engine/ai-diet.service';
import { PlanResponseDto, PlanSummaryDto } from './dto';
import { UserProfile, IngredientData, GeneratedWeekPlan } from '../diet-engine/types';

@Injectable()
export class PlansService {
    constructor(
        private readonly repository: PlansRepository,
        private readonly profilesService: ProfilesService,
        private readonly ingredientsService: IngredientsService,
        private readonly dietEngineService: DietEngineService,
        private readonly aiDietService: AiDietService,
        private readonly exercisePlansService: ExercisePlansService,
    ) { }

    async generateWeeklyPlan(userId: string, weekStart?: string, useAi = false): Promise<PlanResponseDto> {
        // Check plan limit (Max 3 plans total)
        const existingPlans = await this.repository.findAllByUser(userId);
        if (existingPlans.length >= 3) {
            throw new BadRequestException('Has alcanzado el límite máximo de 3 planes. Por favor, elimina uno antes de generar uno nuevo.');
        }

        // Get user profile
        const profile = await this.profilesService.getProfile(userId);
        if (!profile) {
            throw new BadRequestException('Debes crear tu perfil nutricional primero');
        }

        // Get user allergens
        const allergens = await this.profilesService.getAllergens(userId);
        const allergenIds = allergens.map((a) => a.id);

        // Build user profile for engine
        const userProfile: UserProfile = {
            id: userId,
            age: profile.age,
            sex: profile.sex,
            weightKg: profile.weightKg,
            heightCm: profile.heightCm,
            activityLevel: profile.activityLevel,
            mealsPerDay: profile.mealsPerDay,
            dietPattern: profile.dietPattern,
            weightGoalKg: profile.weightGoalKg,
            allergenIds,
        };

        // Calculate weekStart (must be Monday)
        const calculatedWeekStart = this.calculateWeekStart(weekStart);

        let generatedPlan: GeneratedWeekPlan;

        try {
            if (useAi) {
                console.log('🤖 Generating diet plan using AI...');
                console.log('📋 User profile:', JSON.stringify(userProfile, null, 2));
                generatedPlan = await this.aiDietService.generateDietPlan(userProfile);
                // Ensure the AI used the correct weekStart
                generatedPlan.weekStart = calculatedWeekStart;
                console.log('✅ AI plan generated successfully');
            } else {
                // Get all compatible ingredients
                const ingredients = await this.ingredientsService.findAll({});
                const ingredientData: IngredientData[] = ingredients.map((i) => ({
                    ...i,
                    allergenIds: i.allergenIds || [],
                }));

                // Generate plan using Rules Engine
                generatedPlan = this.dietEngineService.generateWeeklyPlan(
                    userProfile,
                    ingredientData,
                    calculatedWeekStart,
                );
            }
        } catch (error: any) {
            console.error('❌ Error generating plan:', error.message);
            console.error('Stack:', error.stack);
            throw new BadRequestException(`Error generando el plan: ${error.message}`);
        }

        // Persist plan
        const savedPlan = await this.repository.create(userId, generatedPlan);

        // Link/Generate Exercise Plan
        try {
            await this.exercisePlansService.getOrGenerateForDietPlan(userId, savedPlan.id);
        } catch (error) {
            console.error('Failed to generate linked exercise plan:', error);
            // Non-blocking error, user still gets diet plan
        }

        return savedPlan;
    }

    async findAllByUser(userId: string): Promise<PlanSummaryDto[]> {
        return this.repository.findAllByUser(userId);
    }

    async findById(userId: string, planId: string): Promise<PlanResponseDto> {
        const plan = await this.repository.findById(planId);

        if (!plan || plan.userId !== userId) {
            throw new NotFoundException('Plan no encontrado');
        }

        return plan;
    }

    async regenerateMeal(
        userId: string,
        planId: string,
        mealId: string,
    ): Promise<PlanResponseDto> {
        const plan = await this.findById(userId, planId);

        // Find the meal
        let targetMeal = null;
        for (const day of plan.days) {
            const meal = day.meals.find((m) => m.id === mealId);
            if (meal) {
                if (meal.isLocked) {
                    throw new BadRequestException('No se puede regenerar una comida bloqueada');
                }
                targetMeal = meal;
                break;
            }
        }

        if (!targetMeal) {
            throw new NotFoundException('Comida no encontrada');
        }

        // TODO: Implement meal regeneration in repository
        // For MVP, we regenerate and update the specific meal

        return this.findById(userId, planId);
    }

    async regenerateDay(
        userId: string,
        planId: string,
        dayOfWeek: DayOfWeek,
    ): Promise<PlanResponseDto> {
        const plan = await this.findById(userId, planId);

        const dayPlan = plan.days.find((d) => d.dayOfWeek === dayOfWeek);
        if (!dayPlan) {
            throw new NotFoundException('Día no encontrado');
        }

        // Check for locked meals
        const lockedMeals = dayPlan.meals.filter((m) => m.isLocked);
        if (lockedMeals.length > 0) {
            throw new BadRequestException(
                'No se puede regenerar el día porque tiene comidas bloqueadas',
            );
        }

        // TODO: Implement day regeneration

        return this.findById(userId, planId);
    }

    async setMealLock(
        userId: string,
        planId: string,
        mealId: string,
        isLocked: boolean,
    ): Promise<void> {
        await this.findById(userId, planId); // Validate ownership
        await this.repository.updateMealLock(mealId, isLocked);
    }

    async archivePlan(userId: string, planId: string): Promise<void> {
        await this.findById(userId, planId); // Validate ownership
        await this.repository.updateStatus(planId, PlanStatus.ARCHIVED);
    }

    async deletePlan(userId: string, planId: string): Promise<void> {
        await this.findById(userId, planId); // Validate ownership
        await this.repository.delete(planId);
    }

    /**
     * Calculate week start date (must be Monday)
     * If no date provided, returns next Monday
     * If date provided but not Monday, normalizes to previous Monday
     */
    private calculateWeekStart(dateStr?: string): string {
        let date: Date;

        if (dateStr) {
            date = new Date(dateStr);
        } else {
            date = new Date();
        }

        // Get day of week (0 = Sunday, 1 = Monday, ...)
        const dayOfWeek = date.getDay();

        // Calculate days to subtract to get to Monday
        // If Sunday (0), go back 6 days
        // If Monday (1), go back 0 days
        // If Tuesday (2), go back 1 day, etc.
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        if (!dateStr) {
            // If no date provided, get NEXT Monday
            const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
            date.setDate(date.getDate() + daysUntilMonday);
        } else if (daysToMonday > 0) {
            // Normalize to previous Monday
            date.setDate(date.getDate() - daysToMonday);
        }

        return date.toISOString().split('T')[0];
    }
}
