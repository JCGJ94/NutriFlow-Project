import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { AuthUser } from '../auth/strategies/supabase-jwt.strategy';
import { ExercisePlansService } from './exercise-plans.service';

@ApiTags('Exercise Plans')
@Controller('exercise-plans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExercisePlansController {
    constructor(private readonly exercisePlansService: ExercisePlansService) { }

    @Post('generate')
    @ApiOperation({ summary: 'Generate exercise plan based on user profile' })
    async generateExercisePlan(@User() user: AuthUser) {
        return this.exercisePlansService.generateExercisePlan(user.id);
    }

    @Get(':dietPlanId')
    @ApiOperation({ summary: 'Get exercise plan linked to a diet plan' })
    async getExercisePlan(
        @Param('dietPlanId') dietPlanId: string,
        @User() user: AuthUser,
    ) {
        return this.exercisePlansService.getOrGenerateForDietPlan(user.id, dietPlanId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all exercise plans for user' })
    async getAllExercisePlans(@User() user: AuthUser) {
        return this.exercisePlansService.getAllForUser(user.id);
    }
}
