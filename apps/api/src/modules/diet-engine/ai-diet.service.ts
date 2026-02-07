import { Injectable } from '@nestjs/common';
import { DietNarrationService } from './diet-narration.service';
import { GeneratedWeekPlan, UserProfile } from './types';

/**
 * @deprecated This service previously handled AI plan generation.
 * It now acts as a simplified interface for narration requests.
 * Core plan generation has moved to DietEngineService.
 */
@Injectable()
export class AiDietService {

  constructor(
    private readonly narrationService: DietNarrationService,
  ) { }

  /**
   * @deprecated The AI no longer generates the plan structure. 
   * Use DietEngineService.generateWeeklyPlan() instead.
   */
  async generateDietPlan(_profile: UserProfile): Promise<GeneratedWeekPlan> {
    throw new Error('AiDietService.generateDietPlan is deprecated. Use DietEngineService.generateWeeklyPlan for deterministic generation.');
  }

  /**
   * Generate narration for an existing plan
   */
  async narratePlan(plan: GeneratedWeekPlan, profile: UserProfile) {
    return this.narrationService.narrateWeekPlan(plan, profile);
  }
}
