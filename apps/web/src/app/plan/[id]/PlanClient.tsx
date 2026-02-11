'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Utensils,
    Dumbbell,
    ArrowLeft,
    ShoppingCart,
    Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NutritionHeader } from '@/components/plan/NutritionHeader';
import { MealCard } from '@/components/plan/MealCard';
import { ExerciseDayCard, ExerciseDetail } from '@/components/exercise/ExerciseCards';
import { getDayName, cn } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { usePlans } from '@/context/PlansContext';
import { useLanguage } from '@/context/LanguageContext';
import { apiClient } from '@/lib/apiClient';

// Types (should be shared)
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
    dayOfWeek: number; // Enum in backend but number here
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

type TabType = 'diet' | 'exercise';

interface PlanClientProps {
    planId: string;
    initialPlan: Plan | null;
    initialExercisePlan: ExercisePlan | null;
}

export function PlanClient({ planId, initialPlan, initialExercisePlan }: PlanClientProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const { t, language } = useLanguage();
    
    // Local state for UI
    const [activeTab, setActiveTab] = useState<TabType>('diet');
    const [selectedDietDay, setSelectedDietDay] = useState<number>(0);
    const [selectedExerciseDay, setSelectedExerciseDay] = useState<number>(0);
    const [regeneratingMeal, setRegeneratingMeal] = useState<string | null>(null);

    // Optimistic Plan State
    // We initialize with the server prop, but allow local updates to "win" momentarily
    const [optimisticPlan, setOptimisticPlan] = useState<Plan | null>(initialPlan);

    // Sync server updates if they happen (e.g. revalidation from other tabs/users)
    // But be careful not to overwrite valid optimistic state if we are "ahead"
    // For simplicity in this version, we trust props if they change significantly or we force it.
    useEffect(() => {
        if (initialPlan) {
             setOptimisticPlan(initialPlan);
        }
    }, [initialPlan]);
    
    // State for exercise plan (sync with prop but allow updates/fetching)
    const [exercisePlan, setExercisePlan] = useState<ExercisePlan | null>(initialExercisePlan);
    const [isLoadingExercise, setIsLoadingExercise] = useState(false);

    // Get context for fetching if needed
    const { getExercisePlan } = usePlans();

    // Effect: If exercise plan is missing (e.g. generation delay), poll for it
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (!exercisePlan && planId) {
            let attempts = 0;
            const maxAttempts = 10; // Max 20-30 seconds waiting

            const pollExercise = async () => {
                setIsLoadingExercise(true);
                try {
                    const data = await getExercisePlan(planId);
                    if (data) {
                        setExercisePlan(data);
                        setIsLoadingExercise(false);
                        return; // Found it, stop polling
                    }
                } catch (error) {
                    console.error('Polling attempt failed:', error);
                }

                attempts++;
                if (attempts < maxAttempts) {
                    // Retry in 2-3 seconds
                    timeoutId = setTimeout(pollExercise, 2500);
                } else {
                    // Stop trying after max limits
                    setIsLoadingExercise(false);
                }
            };

            pollExercise();
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [planId, exercisePlan, getExercisePlan]);

    const regenerateMeal = async (mealId: string) => {
        if (regeneratingMeal) return; // Prevent double clicks
        setRegeneratingMeal(mealId);
        
        // Optimistic UI: We can't really "guess" the new meal, but we already verify status
        // and spinner is shown. The key is NOT to wait for router.refresh().
        
        try {
            // API returns the NEW plan directly
            const newPlan = await apiClient.post<Plan>(`/plans/${planId}/regenerate-meal`, { mealId });
            
            // 1. Update State Instantly
            setOptimisticPlan(newPlan);
            showToast(t('plans.gen_success'), 'success');
            
            // 2. Silent Sync (no await)
            router.refresh(); 

        } catch (error) {
            console.error('Error regenerating meal:', error);
            showToast(t('plans.gen_error'), 'error');
        } finally {
            setRegeneratingMeal(null);
        }
    };

    const toggleMealLock = async (mealId: string, isLocked: boolean) => {
        if (!optimisticPlan) return;

        // 1. Optimistic Update
        const previousPlan = { ...optimisticPlan };
        const newLockedState = !isLocked;

        // Deep clone or functional update to avoid mutating state directly
        const updatedPlan = {
            ...optimisticPlan,
            days: optimisticPlan.days.map(day => ({
                ...day,
                meals: day.meals.map(meal => 
                    meal.id === mealId ? { ...meal, isLocked: newLockedState } : meal
                )
            }))
        };

        setOptimisticPlan(updatedPlan);

        try {
            // 2. API Call in Background
            await apiClient.post(`/plans/${planId}/lock-meal`, { mealId, isLocked: newLockedState });
            
            // 3. Silent Sync
            router.refresh(); 
        } catch (error) {
            console.error('Error toggling lock:', error);
            // Revert on failure
            setOptimisticPlan(previousPlan);
            showToast(t('common.error'), 'error');
        }
    };

    if (!optimisticPlan) {
        return (
            <div className="min-h-screen bg-surface-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-heading font-semibold text-surface-900 mb-2">
                        {t('plans.no_plan')}
                    </h2>
                    <Link href="/dashboard" className="btn-primary">
                        {t('plans.back_dashboard')}
                    </Link>
                </div>
            </div>
        );
    }

    const selectedDietDayData = optimisticPlan.days.find(d => d.dayOfWeek === selectedDietDay);
    const selectedExerciseDayData = exercisePlan?.workoutDays.find(d => d.dayOfWeek === selectedExerciseDay);

    return (
        <div className="min-h-screen bg-page-gradient pt-16">

            {/* Header */}
            <header className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-800 sticky top-16 z-30 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-6">
                            <Link
                                href="/dashboard"
                                className="group p-2.5 rounded-2xl bg-surface-50 dark:bg-surface-800 hover:bg-white dark:hover:bg-surface-700 hover:shadow-md transition-all duration-300"
                            >
                                <ArrowLeft className="w-5 h-5 text-surface-600 dark:text-surface-300 group-hover:-translate-x-1 transition-transform" />
                            </Link>
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-200">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <span className="text-xl font-heading font-black text-surface-900 dark:text-white tracking-tight">
                                        {t('plans.weekly_plan')}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-surface-400">
                                            {t('plans.diet_exercise')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Link
                            href={`/shopping-list/${planId}`}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-surface-900 text-white font-bold hover:bg-surface-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                            data-testid="nav-shopping-list"
                            onMouseEnter={() => router.prefetch(`/shopping-list/${planId}`)}
                        >
                            <ShoppingCart size={18} />
                            <span className="hidden sm:inline">{t('plans.shopping_list_btn')}</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-4 py-4">
                        <button
                            onClick={() => setActiveTab('diet')}
                            className={cn(
                                "flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all duration-300",
                                activeTab === 'diet'
                                    ? "bg-primary-600 text-white shadow-lg shadow-primary-200"
                                    : "bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
                            )}
                            data-testid="tab-diet"
                        >
                            <Utensils size={20} />
                            <span>{t('plans.nutritional')}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('exercise')}
                            className={cn(
                                "flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all duration-300",
                                activeTab === 'exercise'
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                    : "bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
                            )}
                            data-testid="tab-exercise"
                        >
                            <Dumbbell size={20} />
                            <span>{t('plans.exercise')}</span>
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                <AnimatePresence mode="wait">
                    {activeTab === 'diet' && (
                        <motion.div
                            key="diet"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-10"
                        >
                            {/* Nutrition Summary */}
                            <NutritionHeader
                                kcal={optimisticPlan.targetKcal}
                                protein={optimisticPlan.targetProtein}
                                carbs={optimisticPlan.targetCarbs}
                                fat={optimisticPlan.targetFat}
                            />

                            <div className="flex flex-col lg:flex-row gap-10">
                                {/* Day Selection Sidebar */}
                                <aside className="lg:w-72 flex-shrink-0">
                                    <div className="sticky top-40 space-y-2">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-surface-400 mb-6 pl-2">
                                            {t('plans.calendar')}
                                        </h3>
                                        {optimisticPlan.days.map((day) => (
                                            <button
                                                key={day.dayOfWeek}
                                                onClick={() => setSelectedDietDay(day.dayOfWeek)}
                                                className={cn(
                                                    "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group",
                                                    selectedDietDay === day.dayOfWeek
                                                        ? "bg-white dark:bg-surface-800 shadow-xl shadow-primary-100/50 dark:shadow-none border border-primary-100 dark:border-primary-900 text-primary-600 dark:text-primary-400"
                                                        : "text-surface-500 dark:text-surface-400 hover:bg-white dark:hover:bg-surface-800 hover:shadow-md border border-transparent"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all",
                                                    selectedDietDay === day.dayOfWeek
                                                        ? "bg-primary-600 text-white rotate-3"
                                                        : "bg-surface-100 dark:bg-surface-800 text-surface-400 dark:text-surface-500 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 group-hover:text-primary-500 dark:group-hover:text-primary-400"
                                                )}>
                                                    {getDayName(day.dayOfWeek, language).charAt(0)}
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-heading font-black text-sm uppercase tracking-wide">
                                                        {getDayName(day.dayOfWeek, language)}
                                                    </div>
                                                    <div className="text-[10px] font-bold opacity-70">
                                                        {day.totalKcal} kcal
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </aside>

                                {/* Meals Display */}
                                <div className="flex-1 space-y-8">
                                    {selectedDietDayData && (
                                        <div className="space-y-8">
                                            <div className="flex items-end justify-between px-2">
                                                <div>
                                                    <h3 className="text-4xl font-heading font-black text-surface-900 dark:text-white">
                                                        {getDayName(selectedDietDayData.dayOfWeek, language)}
                                                    </h3>
                                                    <p className="text-primary-600 dark:text-primary-400 font-bold mt-1">
                                                        {selectedDietDayData.totalKcal} kcal · {selectedDietDayData.meals.length} {t('plans.meals')}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                {selectedDietDayData.meals.map((meal, idx) => (
                                                    <motion.div
                                                        key={meal.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.05, duration: 0.3 }}
                                                    >
                                                        <MealCard
                                                            meal={meal}
                                                            onToggleLock={toggleMealLock}
                                                            onRegenerate={regenerateMeal}
                                                            isRegenerating={regeneratingMeal === meal.id}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'exercise' && (
                        <motion.div
                            key="exercise"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-10"
                        >
                            {isLoadingExercise && !exercisePlan ? (
                                <div className="animate-pulse space-y-10">
                                    {/* Header Skeleton */}
                                    <div className="h-48 rounded-3xl bg-surface-200 dark:bg-surface-800" />
                                    
                                    <div className="flex flex-col lg:flex-row gap-10">
                                        {/* Sidebar Skeleton */}
                                        <aside className="lg:w-80 flex-shrink-0 space-y-4">
                                            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                                <div key={i} className="h-20 rounded-2xl bg-surface-200 dark:bg-surface-800" />
                                            ))}
                                        </aside>
                                        
                                        {/* Detail Skeleton */}
                                        <div className="flex-1 h-[600px] rounded-3xl bg-surface-200 dark:bg-surface-800" />
                                    </div>
                                </div>
                            ) : exercisePlan ? (
                                <>
                                    {/* Exercise Summary Header */}
                                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl shadow-blue-200/50">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                            <div>
                                                <h2 className="text-3xl font-heading font-black mb-2">
                                                    {t('exercise.title')}
                                                </h2>
                                                <p className="text-blue-100">
                                                    {t('exercise.days_per_week').replace('{{count}}', exercisePlan.daysPerWeek.toString())}
                                                </p>
                                            </div>
                                            <div className="flex gap-8">
                                                <div className="text-center">
                                                    <div className="text-4xl font-black">
                                                        {exercisePlan.workoutDays.filter(d => !d.isRestDay).length}
                                                    </div>
                                                    <div className="text-sm text-blue-200">{t('exercise.active_days')}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-4xl font-black">
                                                        {exercisePlan.workoutDays.reduce((sum, d) => sum + d.caloriesBurned, 0)}
                                                    </div>
                                                    <div className="text-sm text-blue-200">{t('exercise.kcal_week')}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col lg:flex-row gap-10">
                                        {/* Day Selection Sidebar */}
                                        <aside className="lg:w-80 flex-shrink-0">
                                            <div className="sticky top-40 space-y-2">
                                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-surface-400 mb-6 pl-2">
                                                    {t('exercise.routine')}
                                                </h3>
                                                {exercisePlan.workoutDays.map((day) => (
                                                    <ExerciseDayCard
                                                        key={day.dayOfWeek}
                                                        day={day}
                                                        isSelected={selectedExerciseDay === day.dayOfWeek}
                                                        onClick={() => setSelectedExerciseDay(day.dayOfWeek)}
                                                    />
                                                ))}
                                            </div>
                                        </aside>

                                        {/* Exercise Detail */}
                                        <div className="flex-1">
                                            {selectedExerciseDayData && (
                                                <ExerciseDetail day={selectedExerciseDayData} />
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-20 text-surface-500">
                                    <p>{t('exercise.no_plan')}</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
