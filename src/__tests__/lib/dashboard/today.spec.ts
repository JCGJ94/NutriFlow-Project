import { describe, it, expect } from 'vitest';
import { dayIndexInPlan } from '@/lib/dashboard/today';

describe('dayIndexInPlan', () => {
    it('is 0 on the Monday the plan starts', () => {
        expect(dayIndexInPlan('2026-10-19', new Date('2026-10-19T09:00:00'))).toBe(0);
    });

    it('is 6 on the Sunday of the plan week', () => {
        expect(dayIndexInPlan('2026-10-19', new Date('2026-10-25T23:00:00'))).toBe(6);
    });

    it('is null before the plan starts', () => {
        expect(dayIndexInPlan('2026-10-19', new Date('2026-10-18T12:00:00'))).toBeNull();
    });

    it('is null after the plan week ends', () => {
        expect(dayIndexInPlan('2026-10-19', new Date('2026-10-26T00:30:00'))).toBeNull();
    });
});
