import { AiDietService } from './ai-diet.service';
import { DietNarrationService } from './diet-narration.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { UserProfile, GeneratedWeekPlan } from './types';

describe('AiDietService', () => {
    let service: AiDietService;
    let narrationServiceMock: any;

    const mockProfile: UserProfile = {
        id: 'user-123',
        age: 30,
    } as any;

    beforeEach(() => {
        narrationServiceMock = {
            narrateWeekPlan: vi.fn(),
        };

        service = new AiDietService(narrationServiceMock as unknown as DietNarrationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('generateDietPlan should throw deprecated error', async () => {
        await expect(service.generateDietPlan(mockProfile)).rejects.toThrow(/deprecated/);
    });

    it('narratePlan should delegate to DietNarrationService', async () => {
        const mockPlan: GeneratedWeekPlan = { weekStart: '2026-02-10' } as any;
        const mockResponse = { summary: 'Plan narration' };

        narrationServiceMock.narrateWeekPlan.mockResolvedValue(mockResponse);

        const result = await service.narratePlan(mockPlan, mockProfile);

        expect(narrationServiceMock.narrateWeekPlan).toHaveBeenCalledWith(mockPlan, mockProfile);
        expect(result).toEqual(mockResponse);
    });
});
