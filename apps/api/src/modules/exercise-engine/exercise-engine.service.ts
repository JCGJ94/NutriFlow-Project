import { Injectable } from '@nestjs/common';
import {
    GeneratedExercisePlan,
    GeneratedWorkoutDay,
    GeneratedExerciseSet,
    ActivityLevel,
    ExerciseGoal,
} from '@nutriflow/shared';

interface ExerciseProfile {
    activityLevel: ActivityLevel;
    goal: ExerciseGoal;
    age: number;
    sex: string;
    language?: 'es' | 'en';
}

// Exercise database (ES)
const EXERCISE_DATABASE_ES = {
    chest: [
        { name: 'Press de banca', sets: 4, reps: 10, restSec: 90 },
        { name: 'Flexiones', sets: 3, reps: 15, restSec: 60 },
        { name: 'Aperturas con mancuernas', sets: 3, reps: 12, restSec: 60 },
        { name: 'Press inclinado', sets: 3, reps: 10, restSec: 90 },
    ],
    back: [
        { name: 'Dominadas', sets: 4, reps: 8, restSec: 90 },
        { name: 'Remo con barra', sets: 4, reps: 10, restSec: 90 },
        { name: 'Jalón al pecho', sets: 3, reps: 12, restSec: 60 },
        { name: 'Remo con mancuerna', sets: 3, reps: 10, restSec: 60 },
    ],
    legs: [
        { name: 'Sentadillas', sets: 4, reps: 10, restSec: 120 },
        { name: 'Peso muerto rumano', sets: 4, reps: 10, restSec: 90 },
        { name: 'Prensa de piernas', sets: 3, reps: 12, restSec: 90 },
        { name: 'Zancadas', sets: 3, reps: 12, restSec: 60 },
        { name: 'Extensiones de cuádriceps', sets: 3, reps: 15, restSec: 45 },
    ],
    shoulders: [
        { name: 'Press militar', sets: 4, reps: 10, restSec: 90 },
        { name: 'Elevaciones laterales', sets: 3, reps: 15, restSec: 45 },
        { name: 'Face pulls', sets: 3, reps: 15, restSec: 45 },
        { name: 'Elevaciones frontales', sets: 3, reps: 12, restSec: 45 },
    ],
    arms: [
        { name: 'Curl de bíceps', sets: 3, reps: 12, restSec: 60 },
        { name: 'Extensiones de tríceps', sets: 3, reps: 12, restSec: 60 },
        { name: 'Curl martillo', sets: 3, reps: 10, restSec: 45 },
        { name: 'Fondos en paralelas', sets: 3, reps: 10, restSec: 60 },
    ],
    core: [
        { name: 'Plancha', sets: 3, durationSec: 45, restSec: 30 },
        { name: 'Crunches', sets: 3, reps: 20, restSec: 30 },
        { name: 'Elevación de piernas', sets: 3, reps: 15, restSec: 30 },
        { name: 'Russian twists', sets: 3, reps: 20, restSec: 30 },
    ],
    cardio: [
        { name: 'Carrera continua', sets: 1, durationSec: 1800, restSec: 0 },
        { name: 'Bicicleta estática', sets: 1, durationSec: 1200, restSec: 0 },
        { name: 'Elíptica', sets: 1, durationSec: 1500, restSec: 0 },
        { name: 'Saltar la cuerda', sets: 5, durationSec: 120, restSec: 60 },
    ],
    hiit: [
        { name: 'Burpees', sets: 4, reps: 10, restSec: 30 },
        { name: 'Mountain climbers', sets: 4, durationSec: 30, restSec: 15 },
        { name: 'Jumping jacks', sets: 4, durationSec: 45, restSec: 15 },
        { name: 'Sentadillas con salto', sets: 4, reps: 12, restSec: 30 },
    ],
};

// Exercise database (EN)
const EXERCISE_DATABASE_EN = {
    chest: [
        { name: 'Bench Press', sets: 4, reps: 10, restSec: 90 },
        { name: 'Push-ups', sets: 3, reps: 15, restSec: 60 },
        { name: 'Dumbbell Flyes', sets: 3, reps: 12, restSec: 60 },
        { name: 'Incline Press', sets: 3, reps: 10, restSec: 90 },
    ],
    back: [
        { name: 'Pull-ups', sets: 4, reps: 8, restSec: 90 },
        { name: 'Barbell Row', sets: 4, reps: 10, restSec: 90 },
        { name: 'Lat Pulldown', sets: 3, reps: 12, restSec: 60 },
        { name: 'Dumbbell Row', sets: 3, reps: 10, restSec: 60 },
    ],
    legs: [
        { name: 'Squats', sets: 4, reps: 10, restSec: 120 },
        { name: 'Romanian Deadlift', sets: 4, reps: 10, restSec: 90 },
        { name: 'Leg Press', sets: 3, reps: 12, restSec: 90 },
        { name: 'Lunges', sets: 3, reps: 12, restSec: 60 },
        { name: 'Leg Extensions', sets: 3, reps: 15, restSec: 45 },
    ],
    shoulders: [
        { name: 'Overhead Press', sets: 4, reps: 10, restSec: 90 },
        { name: 'Lateral Raises', sets: 3, reps: 15, restSec: 45 },
        { name: 'Face Pulls', sets: 3, reps: 15, restSec: 45 },
        { name: 'Front Raises', sets: 3, reps: 12, restSec: 45 },
    ],
    arms: [
        { name: 'Bicep Curls', sets: 3, reps: 12, restSec: 60 },
        { name: 'Tricep Extensions', sets: 3, reps: 12, restSec: 60 },
        { name: 'Hammer Curls', sets: 3, reps: 10, restSec: 45 },
        { name: 'Dips', sets: 3, reps: 10, restSec: 60 },
    ],
    core: [
        { name: 'Plank', sets: 3, durationSec: 45, restSec: 30 },
        { name: 'Crunches', sets: 3, reps: 20, restSec: 30 },
        { name: 'Leg Raises', sets: 3, reps: 15, restSec: 30 },
        { name: 'Russian Twists', sets: 3, reps: 20, restSec: 30 },
    ],
    cardio: [
        { name: 'Running', sets: 1, durationSec: 1800, restSec: 0 },
        { name: 'Stationary Bike', sets: 1, durationSec: 1200, restSec: 0 },
        { name: 'Elliptical', sets: 1, durationSec: 1500, restSec: 0 },
        { name: 'Jump Rope', sets: 5, durationSec: 120, restSec: 60 },
    ],
    hiit: [
        { name: 'Burpees', sets: 4, reps: 10, restSec: 30 },
        { name: 'Mountain Climbers', sets: 4, durationSec: 30, restSec: 15 },
        { name: 'Jumping Jacks', sets: 4, durationSec: 45, restSec: 15 },
        { name: 'Jump Squats', sets: 4, reps: 12, restSec: 30 },
    ],
};

// Workout templates (ES)
const WORKOUT_TEMPLATES_ES = {
    build_muscle_3: [
        { name: 'Full Body A', type: 'strength', muscles: ['chest', 'back', 'legs', 'core'] },
        { name: 'Descanso', type: 'rest', muscles: [] },
        { name: 'Full Body B', type: 'strength', muscles: ['shoulders', 'arms', 'legs', 'core'] },
        { name: 'Descanso', type: 'rest', muscles: [] },
        { name: 'Full Body C', type: 'strength', muscles: ['chest', 'back', 'shoulders', 'arms'] },
        { name: 'Descanso', type: 'rest', muscles: [] },
        { name: 'Descanso Activo', type: 'flexibility', muscles: ['core'] },
    ],
    build_muscle_4: [
        { name: 'Pecho + Tríceps', type: 'strength', muscles: ['chest', 'arms'] },
        { name: 'Espalda + Bíceps', type: 'strength', muscles: ['back', 'arms'] },
        { name: 'Descanso', type: 'rest', muscles: [] },
        { name: 'Piernas + Glúteos', type: 'strength', muscles: ['legs'] },
        { name: 'Hombros + Core', type: 'strength', muscles: ['shoulders', 'core'] },
        { name: 'Descanso', type: 'rest', muscles: [] },
        { name: 'Descanso', type: 'rest', muscles: [] },
    ],
    lose_weight_4: [
        { name: 'HIIT + Core', type: 'hiit', muscles: ['hiit', 'core'] },
        { name: 'Fuerza Tren Superior', type: 'strength', muscles: ['chest', 'back', 'shoulders'] },
        { name: 'Cardio Moderado', type: 'cardio', muscles: ['cardio'] },
        { name: 'Descanso', type: 'rest', muscles: [] },
        { name: 'Fuerza Tren Inferior', type: 'strength', muscles: ['legs', 'core'] },
        { name: 'HIIT', type: 'hiit', muscles: ['hiit'] },
        { name: 'Descanso Activo', type: 'cardio', muscles: ['cardio'] },
    ],
    maintain_3: [
        { name: 'Full Body', type: 'strength', muscles: ['chest', 'back', 'legs'] },
        { name: 'Cardio', type: 'cardio', muscles: ['cardio'] },
        { name: 'Descanso', type: 'rest', muscles: [] },
        { name: 'Full Body', type: 'strength', muscles: ['shoulders', 'arms', 'core'] },
        { name: 'Descanso', type: 'rest', muscles: [] },
        { name: 'Cardio + HIIT', type: 'hiit', muscles: ['hiit', 'core'] },
        { name: 'Descanso', type: 'rest', muscles: [] },
    ],
};

// Workout templates (EN)
const WORKOUT_TEMPLATES_EN = {
    build_muscle_3: [
        { name: 'Full Body A', type: 'strength', muscles: ['chest', 'back', 'legs', 'core'] },
        { name: 'Rest Day', type: 'rest', muscles: [] },
        { name: 'Full Body B', type: 'strength', muscles: ['shoulders', 'arms', 'legs', 'core'] },
        { name: 'Rest Day', type: 'rest', muscles: [] },
        { name: 'Full Body C', type: 'strength', muscles: ['chest', 'back', 'shoulders', 'arms'] },
        { name: 'Rest Day', type: 'rest', muscles: [] },
        { name: 'Active Recovery', type: 'flexibility', muscles: ['core'] },
    ],
    build_muscle_4: [
        { name: 'Chest + Triceps', type: 'strength', muscles: ['chest', 'arms'] },
        { name: 'Back + Biceps', type: 'strength', muscles: ['back', 'arms'] },
        { name: 'Rest Day', type: 'rest', muscles: [] },
        { name: 'Legs + Glutes', type: 'strength', muscles: ['legs'] },
        { name: 'Shoulders + Core', type: 'strength', muscles: ['shoulders', 'core'] },
        { name: 'Rest Day', type: 'rest', muscles: [] },
        { name: 'Rest Day', type: 'rest', muscles: [] },
    ],
    lose_weight_4: [
        { name: 'HIIT + Core', type: 'hiit', muscles: ['hiit', 'core'] },
        { name: 'Upper Body Strength', type: 'strength', muscles: ['chest', 'back', 'shoulders'] },
        { name: 'Moderate Cardio', type: 'cardio', muscles: ['cardio'] },
        { name: 'Rest Day', type: 'rest', muscles: [] },
        { name: 'Lower Body Strength', type: 'strength', muscles: ['legs', 'core'] },
        { name: 'HIIT', type: 'hiit', muscles: ['hiit'] },
        { name: 'Active Recovery', type: 'cardio', muscles: ['cardio'] },
    ],
    maintain_3: [
        { name: 'Full Body', type: 'strength', muscles: ['chest', 'back', 'legs'] },
        { name: 'Cardio', type: 'cardio', muscles: ['cardio'] },
        { name: 'Rest Day', type: 'rest', muscles: [] },
        { name: 'Full Body', type: 'strength', muscles: ['shoulders', 'arms', 'core'] },
        { name: 'Rest Day', type: 'rest', muscles: [] },
        { name: 'Cardio + HIIT', type: 'hiit', muscles: ['hiit', 'core'] },
        { name: 'Rest Day', type: 'rest', muscles: [] },
    ],
};

@Injectable()
export class ExerciseEngineService {
    generateExercisePlan(profile: ExerciseProfile, weekStart: string): GeneratedExercisePlan {
        const lang = profile.language === 'en' ? 'en' : 'es';
        const daysPerWeek = this.getDaysPerWeek(profile.activityLevel);
        const templateKey = this.getTemplateKey(profile.goal, daysPerWeek);

        const templates = lang === 'en' ? WORKOUT_TEMPLATES_EN : WORKOUT_TEMPLATES_ES;
        const template = (templates as any)[templateKey] || (templates as any)['maintain_3'];

        const workoutDays: GeneratedWorkoutDay[] = template.map((day: any, index: number) => {
            if (day.type === 'rest') {
                return this.createRestDay(index, lang);
            }

            const exercises = this.selectExercises(day.muscles, lang);
            const totalDurationMin = this.calculateDuration(exercises);
            const caloriesBurned = this.estimateCalories(day.type, totalDurationMin, profile);

            return {
                dayOfWeek: index,
                name: day.name,
                type: day.type,
                isRestDay: false,
                exercises,
                totalDurationMin,
                caloriesBurned,
            };
        });

        return {
            weekStart,
            goal: profile.goal,
            daysPerWeek,
            workoutDays,
        };
    }

    private getDaysPerWeek(activityLevel: ActivityLevel): number {
        switch (activityLevel) {
            case ActivityLevel.SEDENTARY:
                return 2;
            case ActivityLevel.LIGHTLY_ACTIVE:
                return 3;
            case ActivityLevel.MODERATELY_ACTIVE:
                return 4;
            case ActivityLevel.VERY_ACTIVE:
                return 5;
            case ActivityLevel.EXTREMELY_ACTIVE:
                return 6;
            default:
                return 3;
        }
    }

    private getTemplateKey(goal: ExerciseGoal, days: number): string {
        const mappedDays = days <= 3 ? 3 : 4;
        return `${goal}_${mappedDays}`;
    }

    private createRestDay(dayIndex: number, lang: 'es' | 'en'): GeneratedWorkoutDay {
        return {
            dayOfWeek: dayIndex,
            name: lang === 'en' ? 'Rest Day' : 'Descanso',
            type: 'rest',
            isRestDay: true,
            exercises: [],
            totalDurationMin: 0,
            caloriesBurned: 0,
        };
    }

    private selectExercises(muscleGroups: string[], lang: 'es' | 'en'): GeneratedExerciseSet[] {
        const exercises: GeneratedExerciseSet[] = [];
        const database = lang === 'en' ? EXERCISE_DATABASE_EN : EXERCISE_DATABASE_ES;

        muscleGroups.forEach(muscle => {
            const available = (database as any)[muscle] || [];
            // Select 2-3 exercises per muscle group
            const count = Math.min(available.length, muscle === 'core' ? 2 : 3);
            const selected = this.shuffleArray([...available]).slice(0, count);

            selected.forEach((ex: any) => {
                exercises.push({
                    exerciseName: ex.name,
                    sets: ex.sets,
                    reps: ex.reps,
                    durationSec: ex.durationSec,
                    restSec: ex.restSec,
                });
            });
        });

        return exercises;
    }

    private calculateDuration(exercises: GeneratedExerciseSet[]): number {
        let totalSeconds = 0;

        exercises.forEach(ex => {
            const setTime = ex.durationSec || (ex.reps || 10) * 3; // 3 seconds per rep estimate
            totalSeconds += (setTime + ex.restSec) * ex.sets;
        });

        return Math.round(totalSeconds / 60);
    }

    private estimateCalories(type: string, durationMin: number, _profile: ExerciseProfile): number {
        // MET values for different exercise types
        const metValues: Record<string, number> = {
            strength: 5,
            cardio: 7,
            hiit: 10,
            flexibility: 3,
            rest: 0,
        };

        const met = metValues[type] || 5;
        // Simplified calorie calculation: MET * weight(kg) * hours
        // Using 70kg as default weight approximation
        const hours = durationMin / 60;
        return Math.round(met * 70 * hours);
    }

    private shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
