import { Sex, ActivityLevel, DietPattern } from '@nutriflow/shared';
import { AiDietService } from './ai-diet.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('AiDietService Manual Test', () => {
    let service: AiDietService;
    let geminiMock: any;
    let mcpMock: any;
    let configMock: any;

    const mockProfile: any = {
        id: 'user-123',
        age: 30,
        sex: Sex.MALE,
        weightKg: 80,
        heightCm: 180,
        activityLevel: ActivityLevel.MODERATELY_ACTIVE,
        mealsPerDay: 3,
        dietPattern: DietPattern.MEDITERRANEAN,
        allergenIds: [],
    };

    beforeEach(() => {
        geminiMock = { generateText: vi.fn() };
        mcpMock = { query: vi.fn() };
        configMock = { get: vi.fn().mockReturnValue('mock-id') };

        // Manual instantiation
        service = new AiDietService(geminiMock, mcpMock, configMock);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should call generateText with context', async () => {
        const mockResponse = JSON.stringify({
            weekStart: '2026-02-10',
            targetKcal: 2500,
            targetProtein: 150,
            targetCarbs: 250,
            targetFat: 80,
            days: []
        });

        geminiMock.generateText.mockResolvedValue(mockResponse);
        mcpMock.query.mockResolvedValue('Scientific context');

        const plan = await service.generateDietPlan(mockProfile);

        expect(geminiMock.generateText).toHaveBeenCalled();
        expect(plan.weekStart).toBe('2026-02-10');
    });

    it('should handle invalid JSON', async () => {
        geminiMock.generateText.mockResolvedValue('Not a JSON');

        await expect(service.generateDietPlan(mockProfile)).rejects.toThrow('AI failed to generate a valid diet plan format.');
    });
});
