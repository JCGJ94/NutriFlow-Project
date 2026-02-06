'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    Utensils,
    Dumbbell,
    ArrowLeft,
    ShoppingCart,
    Loader2,
    Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NutritionHeader } from '@/components/plan/NutritionHeader';
import { MealCard } from '@/components/plan/MealCard';
import { ExerciseDayCard, ExerciseDetail } from '@/components/exercise/ExerciseCards';
import { DayOfWeek } from '@nutriflow/shared';
import { getDayName, cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

// Types
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
    dayOfWeek: DayOfWeek;
    mealType: string;
    isLocked: boolean;
    totalKcal: number;
    items: MealItem[];
}

interface Day {
    dayOfWeek: DayOfWeek;
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

type TabType = 'diet' | 'exercise';

export default function CombinedPlanPage() {
    const params = useParams();
    const planId = params.id as string;

    const [dietPlan, setDietPlan] = useState<Plan | null>(null);
    const [exercisePlan, setExercisePlan] = useState<ExercisePlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('diet');
    const [selectedDietDay, setSelectedDietDay] = useState<number>(0);
    const [selectedExerciseDay, setSelectedExerciseDay] = useState<number>(0);
    const [regeneratingMeal, setRegeneratingMeal] = useState<string | null>(null);

    useEffect(() => {
        loadPlans();
    }, [planId]);

    const loadPlans = async () => {
        try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const headers: HeadersInit = token 
                ? { 'Authorization': `Bearer ${token}` }
                : {};

            // Load diet plan
            const dietResponse = await fetch(`/api/plans/${planId}`, { headers });
            if (dietResponse.ok) {
                const data = await dietResponse.json();
                setDietPlan(data);
            }

            // Load or generate exercise plan
            const exerciseResponse = await fetch(`/api/exercise-plans/${planId}`, { headers });
            if (exerciseResponse.ok) {
                const data = await exerciseResponse.json();
                setExercisePlan(data);
            } else {
                // Generate a mock exercise plan for now
                setExercisePlan(generateMockExercisePlan());
            }
        } catch (error) {
            console.error('Error loading plans:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Temporary mock data until backend is connected
    const generateMockExercisePlan = (): ExercisePlan => ({
        weekStart: new Date().toISOString(),
        goal: 'maintain',
        daysPerWeek: 4,
        workoutDays: [
            {
                dayOfWeek: 0,
                name: 'Pecho + Tríceps',
                type: 'strength',
                isRestDay: false,
                exercises: [
                    { exerciseName: 'Press de banca', sets: 4, reps: 10, restSec: 90 },
                    { exerciseName: 'Flexiones', sets: 3, reps: 15, restSec: 60 },
                    { exerciseName: 'Aperturas con mancuernas', sets: 3, reps: 12, restSec: 60 },
                    { exerciseName: 'Extensiones de tríceps', sets: 3, reps: 12, restSec: 60 },
                ],
                totalDurationMin: 45,
                caloriesBurned: 280,
            },
            {
                dayOfWeek: 1,
                name: 'Espalda + Bíceps',
                type: 'strength',
                isRestDay: false,
                exercises: [
                    { exerciseName: 'Dominadas', sets: 4, reps: 8, restSec: 90 },
                    { exerciseName: 'Remo con barra', sets: 4, reps: 10, restSec: 90 },
                    { exerciseName: 'Curl de bíceps', sets: 3, reps: 12, restSec: 60 },
                    { exerciseName: 'Curl martillo', sets: 3, reps: 10, restSec: 45 },
                ],
                totalDurationMin: 50,
                caloriesBurned: 320,
            },
            {
                dayOfWeek: 2,
                name: 'Descanso',
                type: 'rest',
                isRestDay: true,
                exercises: [],
                totalDurationMin: 0,
                caloriesBurned: 0,
            },
            {
                dayOfWeek: 3,
                name: 'Piernas + Glúteos',
                type: 'strength',
                isRestDay: false,
                exercises: [
                    { exerciseName: 'Sentadillas', sets: 4, reps: 10, restSec: 120 },
                    { exerciseName: 'Peso muerto rumano', sets: 4, reps: 10, restSec: 90 },
                    { exerciseName: 'Prensa de piernas', sets: 3, reps: 12, restSec: 90 },
                    { exerciseName: 'Zancadas', sets: 3, reps: 12, restSec: 60 },
                ],
                totalDurationMin: 55,
                caloriesBurned: 380,
            },
            {
                dayOfWeek: 4,
                name: 'HIIT + Core',
                type: 'hiit',
                isRestDay: false,
                exercises: [
                    { exerciseName: 'Burpees', sets: 4, reps: 10, restSec: 30 },
                    { exerciseName: 'Mountain climbers', sets: 4, durationSec: 30, restSec: 15 },
                    { exerciseName: 'Plancha', sets: 3, durationSec: 45, restSec: 30 },
                    { exerciseName: 'Crunches', sets: 3, reps: 20, restSec: 30 },
                ],
                totalDurationMin: 25,
                caloriesBurned: 300,
            },
            {
                dayOfWeek: 5,
                name: 'Descanso',
                type: 'rest',
                isRestDay: true,
                exercises: [],
                totalDurationMin: 0,
                caloriesBurned: 0,
            },
            {
                dayOfWeek: 6,
                name: 'Cardio Activo',
                type: 'cardio',
                isRestDay: false,
                exercises: [
                    { exerciseName: 'Carrera continua', sets: 1, durationSec: 1800, restSec: 0 },
                ],
                totalDurationMin: 30,
                caloriesBurned: 350,
            },
        ],
    });

    const regenerateMeal = async (mealId: string) => {
        setRegeneratingMeal(mealId);
        try {
            const response = await fetch(`/api/plans/${planId}/regenerate-meal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mealId }),
            });

            if (response.ok) {
                await loadPlans();
            }
        } catch (error) {
            console.error('Error regenerating meal:', error);
        } finally {
            setRegeneratingMeal(null);
        }
    };

    const toggleMealLock = async (mealId: string, isLocked: boolean) => {
        try {
            await fetch(`/api/plans/${planId}/lock-meal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mealId, isLocked: !isLocked }),
            });
            await loadPlans();
        } catch (error) {
            console.error('Error toggling lock:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-surface-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
        );
    }

    if (!dietPlan) {
        return (
            <div className="min-h-screen bg-surface-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-heading font-semibold text-surface-900 mb-2">
                        Plan no encontrado
                    </h2>
                    <Link href="/dashboard" className="btn-primary">
                        Volver al panel
                    </Link>
                </div>
            </div>
        );
    }

    const selectedDietDayData = dietPlan.days.find(d => d.dayOfWeek === selectedDietDay);
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
                                        Plan Semanal
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-surface-400">
                                            Dieta + Ejercicio
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Link
                            href={`/shopping-list/${planId}`}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-surface-900 text-white font-bold hover:bg-surface-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                        >
                            <ShoppingCart size={18} />
                            <span className="hidden sm:inline">Lista de compra</span>
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
                        >
                            <Utensils size={20} />
                            <span>Plan Nutricional</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('exercise')}
                            className={cn(
                                "flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all duration-300",
                                activeTab === 'exercise'
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                    : "bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
                            )}
                        >
                            <Dumbbell size={20} />
                            <span>Plan de Ejercicios</span>
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
                            className="space-y-10"
                        >
                            {/* Nutrition Summary */}
                            <NutritionHeader
                                kcal={dietPlan.targetKcal}
                                protein={dietPlan.targetProtein}
                                carbs={dietPlan.targetCarbs}
                                fat={dietPlan.targetFat}
                            />

                            <div className="flex flex-col lg:flex-row gap-10">
                                {/* Day Selection Sidebar */}
                                <aside className="lg:w-72 flex-shrink-0">
                                    <div className="sticky top-40 space-y-2">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-surface-400 mb-6 pl-2">
                                            Calendario Semanal
                                        </h3>
                                        {dietPlan.days.map((day) => (
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
                                                    {getDayName(day.dayOfWeek).charAt(0)}
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-heading font-black text-sm uppercase tracking-wide">
                                                        {getDayName(day.dayOfWeek)}
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
                                                        {getDayName(selectedDietDayData.dayOfWeek)}
                                                    </h3>
                                                    <p className="text-primary-600 dark:text-primary-400 font-bold mt-1">
                                                        {selectedDietDayData.totalKcal} kcal · {selectedDietDayData.meals.length} comidas
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                {selectedDietDayData.meals.map((meal, idx) => (
                                                    <motion.div
                                                        key={meal.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.1 }}
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

                    {activeTab === 'exercise' && exercisePlan && (
                        <motion.div
                            key="exercise"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-10"
                        >
                            {/* Exercise Summary Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl shadow-blue-200/50">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                    <div>
                                        <h2 className="text-3xl font-heading font-black mb-2">
                                            Plan de Ejercicios
                                        </h2>
                                        <p className="text-blue-100">
                                            {exercisePlan.daysPerWeek} días de entrenamiento por semana
                                        </p>
                                    </div>
                                    <div className="flex gap-8">
                                        <div className="text-center">
                                            <div className="text-4xl font-black">
                                                {exercisePlan.workoutDays.filter(d => !d.isRestDay).length}
                                            </div>
                                            <div className="text-sm text-blue-200">Días Activos</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-4xl font-black">
                                                {exercisePlan.workoutDays.reduce((sum, d) => sum + d.caloriesBurned, 0)}
                                            </div>
                                            <div className="text-sm text-blue-200">kcal/semana</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col lg:flex-row gap-10">
                                {/* Day Selection Sidebar */}
                                <aside className="lg:w-80 flex-shrink-0">
                                    <div className="sticky top-40 space-y-2">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-surface-400 mb-6 pl-2">
                                            Rutina Semanal
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
