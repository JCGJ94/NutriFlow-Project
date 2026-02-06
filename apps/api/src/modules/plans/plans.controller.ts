import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Delete,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiResponse,
    ApiParam,
} from '@nestjs/swagger';
import { PlansService } from './plans.service';
import {
    GenerateWeeklyPlanDto,
    RegenerateMealDto,
    RegenerateDayDto,
    SetMealLockDto,
    PlanResponseDto,
    PlanSummaryDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { AuthUser } from '../auth/strategies/supabase-jwt.strategy';

@ApiTags('plans')
@ApiBearerAuth('supabase-auth')
@UseGuards(JwtAuthGuard)
@Controller('plans')
export class PlansController {
    constructor(private readonly plansService: PlansService) { }

    @Post('generate-week')
    @ApiOperation({ summary: 'Generar plan semanal (Lunes-Domingo)' })
    @ApiResponse({ status: 201, type: PlanResponseDto })
    async generateWeeklyPlan(
        @User() user: AuthUser,
        @Body() dto: GenerateWeeklyPlanDto,
    ): Promise<PlanResponseDto> {
        return this.plansService.generateWeeklyPlan(user.id, dto.weekStart, dto.useAi);
    }

    @Get()
    @ApiOperation({ summary: 'Listar planes del usuario' })
    @ApiResponse({ status: 200, type: [PlanSummaryDto] })
    async findAll(@User() user: AuthUser): Promise<PlanSummaryDto[]> {
        return this.plansService.findAllByUser(user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener detalle de un plan' })
    @ApiParam({ name: 'id', description: 'ID del plan' })
    @ApiResponse({ status: 200, type: PlanResponseDto })
    async findOne(
        @User() user: AuthUser,
        @Param('id') planId: string,
    ): Promise<PlanResponseDto> {
        return this.plansService.findById(user.id, planId);
    }

    @Post(':id/regenerate-meal')
    @ApiOperation({ summary: 'Regenerar una comida específica' })
    @ApiParam({ name: 'id', description: 'ID del plan' })
    @ApiResponse({ status: 200, type: PlanResponseDto })
    async regenerateMeal(
        @User() user: AuthUser,
        @Param('id') planId: string,
        @Body() dto: RegenerateMealDto,
    ): Promise<PlanResponseDto> {
        return this.plansService.regenerateMeal(user.id, planId, dto.mealId);
    }

    @Post(':id/regenerate-day')
    @ApiOperation({ summary: 'Regenerar todas las comidas de un día' })
    @ApiParam({ name: 'id', description: 'ID del plan' })
    @ApiResponse({ status: 200, type: PlanResponseDto })
    async regenerateDay(
        @User() user: AuthUser,
        @Param('id') planId: string,
        @Body() dto: RegenerateDayDto,
    ): Promise<PlanResponseDto> {
        return this.plansService.regenerateDay(user.id, planId, dto.dayOfWeek);
    }

    @Post(':id/lock-meal')
    @ApiOperation({ summary: 'Bloquear/desbloquear una comida' })
    @ApiParam({ name: 'id', description: 'ID del plan' })
    @ApiResponse({ status: 200 })
    async lockMeal(
        @User() user: AuthUser,
        @Param('id') planId: string,
        @Body() dto: SetMealLockDto,
    ): Promise<void> {
        return this.plansService.setMealLock(user.id, planId, dto.mealId, dto.isLocked);
    }

    @Post(':id/archive')
    @ApiOperation({ summary: 'Archivar un plan' })
    @ApiParam({ name: 'id', description: 'ID del plan' })
    @ApiResponse({ status: 200 })
    async archivePlan(
        @User() user: AuthUser,
        @Param('id') planId: string,
    ): Promise<void> {
        return this.plansService.archivePlan(user.id, planId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un plan permanentemente' })
    @ApiParam({ name: 'id', description: 'ID del plan' })
    @ApiResponse({ status: 200 })
    async deletePlan(
        @User() user: AuthUser,
        @Param('id') planId: string,
    ): Promise<void> {
        return this.plansService.deletePlan(user.id, planId);
    }
}
