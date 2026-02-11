'use client';

import { motion } from 'framer-motion';
import { Dumbbell, Clock, Flame, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { getDayName } from '@/lib/utils';

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

interface ExerciseCardProps {
    day: WorkoutDay;
    isSelected: boolean;
    onClick: () => void;
}

const TYPE_COLORS = {
    strength: 'bg-blue-500',
    cardio: 'bg-green-500',
    hiit: 'bg-orange-500',
    flexibility: 'bg-purple-500',
    rest: 'bg-gray-400',
};

export function ExerciseDayCard({ day, isSelected, onClick }: ExerciseCardProps) {
    const { language } = useLanguage();
    
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group text-left",
                isSelected
                    ? "bg-white dark:bg-surface-800 shadow-xl shadow-blue-100/50 dark:shadow-none border border-blue-100 dark:border-blue-900"
                    : "hover:bg-white dark:hover:bg-surface-800 hover:shadow-md border border-transparent"
            )}
        >
            <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all",
                isSelected
                    ? `${TYPE_COLORS[day.type as keyof typeof TYPE_COLORS] || 'bg-gray-500'} text-white rotate-3`
                    : "bg-surface-100 dark:bg-surface-700 text-surface-400 dark:text-surface-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-500 dark:group-hover:text-blue-400"
            )}>
                {day.isRestDay ? '😴' : <Dumbbell size={20} />}
            </div>
            <div className="flex-1">
                <div className="font-heading font-black text-sm uppercase tracking-wide text-surface-900 dark:text-white">
                    {getDayName(day.dayOfWeek, language)}
                </div>
                <div className="text-xs font-medium text-surface-500 dark:text-surface-400">
                    {day.name}
                </div>
            </div>
            {!day.isRestDay && (
                <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-surface-400 dark:text-surface-500">
                        <Clock size={12} />
                        <span>{day.totalDurationMin}min</span>
                    </div>
                    <div className="flex items-center gap-1 text-orange-500">
                        <Flame size={12} />
                        <span>{day.caloriesBurned}kcal</span>
                    </div>
                </div>
            )}
            <ChevronRight className={cn(
                "w-5 h-5 transition-transform",
                isSelected ? "text-blue-500 rotate-90" : "text-surface-300"
            )} />
        </motion.button>
    );
}

interface ExerciseDetailProps {
    day: WorkoutDay;
}

export function ExerciseDetail({ day }: ExerciseDetailProps) {
    const { t } = useLanguage();
    
    if (day.isRestDay) {
        return (
            <div className="bg-white dark:bg-surface-800 rounded-3xl p-8 shadow-xl shadow-surface-200/50 dark:shadow-none text-center transition-colors duration-300">
                <div className="text-6xl mb-4">🧘‍♂️</div>
                <h3 className="text-2xl font-heading font-black text-surface-900 dark:text-white mb-2">
                    {t('exercise.rest_day')}
                </h3>
                <p className="text-surface-500 dark:text-surface-400">
                    {t('exercise.rest_desc')}
                </p>
            </div>
        );
    }

    const typeLabels: Record<string, string> = {
        strength: t('exercise.type_strength'),
        cardio: t('exercise.type_cardio'),
        hiit: t('exercise.type_hiit'),
        flexibility: t('exercise.type_flexibility'),
        rest: t('exercise.descanso'),
        'rest day': t('exercise.rest_day'),
        'full body': t('exercise.type_fullbody'),
        'full body a': t('exercise.type_fullbody'),
        'full body b': t('exercise.type_fullbody'),
        'full body c': t('exercise.type_fullbody'),
        'upper body': t('exercise.type_upper'),
        'lower body': t('exercise.type_lower'),
        'upper body strength': t('exercise.type_upper'),
        'lower body strength': t('exercise.type_lower'),
        'active recovery': t('exercise.active_recovery') || 'Recuperación Activa',
        'core': t('exercise.type_core'),
    };

    return (
        <div className="bg-white dark:bg-surface-800 rounded-3xl shadow-xl shadow-surface-200/50 dark:shadow-none overflow-hidden transition-colors duration-300">
            {/* Header */}
            <div className={cn(
                "p-6 text-white",
                TYPE_COLORS[day.type as keyof typeof TYPE_COLORS] || 'bg-gray-500'
            )}>
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                            {typeLabels[day.type.toLowerCase()] || typeLabels[day.name.toLowerCase()] || day.type}
                        </span>
                        <h3 className="text-2xl font-heading font-black mt-1">
                            {typeLabels[day.name.toLowerCase()] || day.name}
                        </h3>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-black">{day.totalDurationMin}</div>
                            <div className="text-xs opacity-80">min</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-black">{day.caloriesBurned}</div>
                            <div className="text-xs opacity-80">kcal</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Exercise List */}
            <div className="p-6 space-y-4">
                {day.exercises.map((exercise, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-surface-50 dark:bg-surface-700 hover:bg-surface-100 dark:hover:bg-surface-600 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-xl bg-surface-200 dark:bg-surface-600 flex items-center justify-center font-black text-surface-600 dark:text-surface-200">
                            {idx + 1}
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-surface-900 dark:text-white">
                                {exercise.exerciseName}
                            </div>
                            <div className="text-sm text-surface-500 dark:text-surface-400">
                                {exercise.sets} series × {exercise.reps ? `${exercise.reps} reps` : `${exercise.durationSec}s`}
                                <span className="mx-2">·</span>
                                <span className="text-orange-500">
                                    {t('exercise.descanso')}: {exercise.restSec}s
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
