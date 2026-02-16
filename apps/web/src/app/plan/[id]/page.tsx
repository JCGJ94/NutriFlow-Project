import { apiClient } from '@/lib/apiClient';
import { PlanClient } from './PlanClient';

export const dynamic = 'force-dynamic';

// Types (shared)
interface ExerciseSet {
    exerciseName: string;
    sets: number;
    reps?: number;
    durationSec?: number;
    restSec: number;
}

interface WorkoutDay {
    dayOfWeek: number;
    name: string;
    type: string;
    isRestDay: boolean;
    exercises: ExerciseSet[];
    totalDurationMin: number;
    caloriesBurned: number;
}

interface ExercisePlan {
    weekStart: string;
    goal: string;
    daysPerWeek: number;
    workoutDays: WorkoutDay[];
}

interface MealItem {
    id: string;
    ingredientId: string;
    ingredientName: string;
    grams: number;
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface Meal {
    id: string;
    dayOfWeek: number;
    mealType: string;
    isLocked: boolean;
    totalKcal: number;
    items: MealItem[];
}

interface Day {
    dayOfWeek: number;
    meals: Meal[];
    totalKcal: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
}

interface Plan {
    id: string;
    weekStart: string;
    targetKcal: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
    status: string;
    days: Day[];
}

export default async function CombinedPlanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: planId } = await params;

    // Parallel data fetching for performance (Week 1 Goal)
    let planData: Plan | null = null;
    let exerciseData: ExercisePlan | null = null;

    try {
        const [pData, eData] = await Promise.all([
             apiClient.get<Plan>(`/plans/${planId}`).catch(err => {
                 console.error('Error fetching plan:', err);
                 return null;
             }),
             apiClient.get<ExercisePlan>(`/exercise-plans/${planId}`).catch(err => {
                 console.error('Error fetching exercise plan:', err);
                 return null;
             })
        ]);
        planData = pData;
        exerciseData = eData;
    } catch (e) {
        console.error('Error loading plan page data', e);
    }

    return (
        <PlanClient 
            planId={planId} 
            initialPlan={planData} 
            initialExercisePlan={exerciseData} 
        />
    );
}
