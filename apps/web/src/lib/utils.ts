import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format date to Spanish locale
 */
export function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Format short date
 */
export function formatShortDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
    });
}

/**
 * Get day name in Spanish
 */
export function getDayName(dayOfWeek: number): string {
    const days = [
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes',
        'Sábado',
        'Domingo',
    ];
    return days[dayOfWeek] || '';
}

/**
 * Get meal type name in Spanish
 */
export function getMealTypeName(mealType: string): string {
    const types: Record<string, string> = {
        breakfast: 'Desayuno',
        lunch: 'Almuerzo',
        dinner: 'Cena',
        snack: 'Snack',
    };
    return types[mealType] || mealType;
}

/**
 * Format grams display
 */
export function formatGrams(grams: number): string {
    if (grams >= 1000) {
        return `${(grams / 1000).toFixed(1)} kg`;
    }
    return `${Math.round(grams)} g`;
}

/**
 * Format macros display
 */
export function formatMacros(value: number, unit: string = 'g'): string {
    return `${Math.round(value)}${unit}`;
}
