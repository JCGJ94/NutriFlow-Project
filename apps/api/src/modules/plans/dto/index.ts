import { IsOptional, IsDateString, IsUUID, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DayOfWeek, MealType, PlanStatus } from '@nutriflow/shared';

export class GenerateWeeklyPlanDto {
    @ApiPropertyOptional({
        description: 'Fecha de inicio de la semana (debe ser lunes). Si no se proporciona, se usa el próximo lunes.',
        example: '2024-01-15',
    })
    @IsOptional()
    @IsDateString()
    weekStart?: string;

    @ApiPropertyOptional({
        description: 'Usar IA (Gemini) para generar la dieta en lugar del motor de reglas.',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    useAi?: boolean;
}

export class RegenerateMealDto {
    @ApiProperty({ description: 'ID de la comida a regenerar' })
    @IsUUID()
    mealId!: string;
}

export class RegenerateDayDto {
    @ApiProperty({ enum: DayOfWeek, description: 'Día de la semana a regenerar (0=Lunes, 6=Domingo)' })
    @IsEnum(DayOfWeek)
    dayOfWeek!: DayOfWeek;
}

export class SetMealLockDto {
    @ApiProperty({ description: 'ID de la comida' })
    @IsUUID()
    mealId!: string;

    @ApiProperty({ description: 'Si la comida está bloqueada' })
    @IsBoolean()
    isLocked!: boolean;
}

// Response DTOs

export class MealItemResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    ingredientId!: string;

    @ApiProperty()
    ingredientName!: string;

    @ApiProperty()
    grams!: number;

    @ApiProperty()
    kcal!: number;

    @ApiProperty()
    protein!: number;

    @ApiProperty()
    carbs!: number;

    @ApiProperty()
    fat!: number;
}

export class MealResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty({ enum: DayOfWeek })
    dayOfWeek!: DayOfWeek;

    @ApiProperty({ enum: MealType })
    mealType!: MealType;

    @ApiProperty()
    isLocked!: boolean;

    @ApiProperty()
    totalKcal!: number;

    @ApiProperty({ type: [MealItemResponseDto] })
    items!: MealItemResponseDto[];
}

export class DayResponseDto {
    @ApiProperty({ enum: DayOfWeek })
    dayOfWeek!: DayOfWeek;

    @ApiProperty({ type: [MealResponseDto] })
    meals!: MealResponseDto[];

    @ApiProperty()
    totalKcal!: number;

    @ApiProperty()
    totalProtein!: number;

    @ApiProperty()
    totalCarbs!: number;

    @ApiProperty()
    totalFat!: number;
}

export class PlanResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    userId!: string;

    @ApiProperty()
    weekStart!: string;

    @ApiProperty()
    targetKcal!: number;

    @ApiProperty()
    targetProtein!: number;

    @ApiProperty()
    targetCarbs!: number;

    @ApiProperty()
    targetFat!: number;

    @ApiProperty({ enum: PlanStatus })
    status!: PlanStatus;

    @ApiProperty({ type: [DayResponseDto] })
    days!: DayResponseDto[];

    @ApiProperty()
    createdAt!: Date;
}

export class PlanSummaryDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    weekStart!: string;

    @ApiProperty()
    targetKcal!: number;

    @ApiProperty({ enum: PlanStatus })
    status!: PlanStatus;

    @ApiProperty()
    createdAt!: Date;
}
