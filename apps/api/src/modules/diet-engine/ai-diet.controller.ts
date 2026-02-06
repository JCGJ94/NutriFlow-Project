import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiDietService } from './ai-diet.service';
import { UserProfile } from './types';
import { AuthGuard } from '@nestjs/passport';

@Controller('diet-engine')
@UseGuards(AuthGuard('jwt'))
export class AiDietController {
    constructor(private readonly aiDietService: AiDietService) { }

    @Post('generate-ai')
    async generateAiDiet(@Body() profile: UserProfile) {
        // In a real scenario, we might want to fetch the profile from the database 
        // based on the logged-in user (req.user.id) instead of trusting the body entirely.
        // For this MVP step, we accept the profile to allow flexibility in the UI context.
        const plan = await this.aiDietService.generateDietPlan(profile);
        return plan;
    }
}
