import { describe, it, expect } from 'vitest';
import { formatMacros, formatGrams, getDayName, isValidEmail } from './utils';
import { DayOfWeek } from '@nutriflow/shared';

describe('Frontend Utils', () => {
    describe('formatMacros', () => {
        it('should round to nearest integer and add "g"', () => {
            expect(formatMacros(150.4)).toBe('150g');
            expect(formatMacros(150.6)).toBe('151g');
        });
    });

    describe('formatGrams', () => {
        it('should round to nearest integer and add "g"', () => {
            expect(formatGrams(99.9)).toBe('100g');
            expect(formatGrams(100)).toBe('100g');
        });
    });

    describe('getDayName', () => {
        it('should return correct Spanish day names', () => {
            expect(getDayName(DayOfWeek.MONDAY)).toBe('Lunes');
            expect(getDayName(DayOfWeek.SUNDAY)).toBe('Domingo');
        });
    });

    describe('isValidEmail', () => {
        it('should validate correct emails', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
        });

        it('should fail on invalid emails', () => {
            expect(isValidEmail('invalid-email')).toBe(false);
            expect(isValidEmail('@example.com')).toBe(false);
        });
    });
});
