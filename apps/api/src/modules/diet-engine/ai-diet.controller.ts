import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserProfile } from './types';
import { DietEngineService } from './diet-engine.service';
import { DietNarrationService } from './diet-narration.service';
import { TranslationBridgeService } from './translation-bridge.service';
import { IngredientsService } from '../ingredients/ingredients.service';

@Controller('diet-engine')
@UseGuards(AuthGuard('jwt'))
export class AiDietController {
    constructor(
        private readonly dietEngineService: DietEngineService,
        private readonly ingredientsService: IngredientsService,
        private readonly dietNarrationService: DietNarrationService,
        private readonly translationBridgeService: TranslationBridgeService,
    ) { }

    @Post('generate-ai')
    async generateDiet(@Body() profile: UserProfile) {
        const ingredients = await this.ingredientsService.findAll({});
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1) + 7;
        const nextMonday = new Date(today.setDate(diff)).toISOString().split('T')[0];

        let plan = this.dietEngineService.generateWeeklyPlan(
            profile,
            ingredients as any[],
            nextMonday
        );

        // SYNC: Translate if language is English
        if (profile.language === 'en') {
            plan = await this.translationBridgeService.translatePlan(plan, 'en');
        }

        return plan;
    }

    @Post('narrate')
    async narratePlan(@Body() body: { plan: any, profile: UserProfile, style?: 'concise' | 'detailed' | 'motivaional' }) {
        const { plan, profile, style } = body;
        return this.dietNarrationService.narrateWeekPlan(plan, profile, style);
    }

    @Post('translate')
    async translatePlan(@Body() body: { plan: any, targetLang: 'es' | 'en' }) {
        const { plan, targetLang } = body;
        return this.translationBridgeService.translatePlan(plan, targetLang);
    }
}
