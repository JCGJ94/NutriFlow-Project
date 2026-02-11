import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format date to specified locale
 */
export function formatDate(date: Date | string, lang: 'es' | 'en' = 'es'): string {
    return new Date(date).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Format short date
 */
export function formatShortDate(date: Date | string, lang: 'es' | 'en' = 'es'): string {
    return new Date(date).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
    });
}

/**
 * Get day name in specified language
 */
export function getDayName(dayOfWeek: number, lang: 'es' | 'en' = 'es'): string {
    const days = {
        es: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
        en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    };
    return days[lang][dayOfWeek] || '';
}

/**
 * Get meal type name in specified language
 */
export function getMealTypeName(mealType: string, lang: 'es' | 'en' = 'es'): string {
    const types: Record<string, Record<string, string>> = {
        es: {
            breakfast: 'Desayuno',
            lunch: 'Almuerzo',
            dinner: 'Cena',
            snack: 'Snack',
        },
        en: {
            breakfast: 'Breakfast',
            lunch: 'Lunch',
            dinner: 'Dinner',
            snack: 'Snack',
        }
    };
    return types[lang][mealType] || mealType;
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
export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
