import { IsInt, IsNumber, IsEnum, IsOptional, Min, Max, IsArray, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Sex, ActivityLevel, DietPattern } from '@nutriflow/shared';

export class UpsertProfileDto {
    @ApiPropertyOptional({ description: 'Nombre de usuario', example: 'juanfit23' })
    @IsOptional()
    @IsString()
    username?: string;



    @ApiProperty({ description: 'Edad en años', example: 30, minimum: 18, maximum: 100 })
    @IsInt()
    @Min(18)
    @Max(100)
    age!: number;

    @ApiProperty({ enum: Sex, description: 'Sexo biológico', example: Sex.MALE })
    @IsEnum(Sex)
    sex!: Sex;

    @ApiProperty({ description: 'Peso actual en kg', example: 75.5, minimum: 30, maximum: 300 })
    @IsNumber()
    @Min(30)
    @Max(300)
    weightKg!: number;

    @ApiProperty({ description: 'Altura en cm', example: 175, minimum: 100, maximum: 250 })
    @IsInt()
    @Min(100)
    @Max(250)
    heightCm!: number;

    @ApiProperty({ enum: ActivityLevel, description: 'Nivel de actividad física' })
    @IsEnum(ActivityLevel)
    activityLevel!: ActivityLevel;

    @ApiPropertyOptional({ description: 'Número de comidas por día', example: 3, default: 3 })
    @IsOptional()
    @IsInt()
    @Min(2)
    @Max(6)
    mealsPerDay?: number;

    @ApiPropertyOptional({ enum: DietPattern, description: 'Patrón de dieta', default: DietPattern.OMNIVORE })
    @IsOptional()
    @IsEnum(DietPattern)
    dietPattern?: DietPattern;

    @ApiPropertyOptional({ description: 'Peso objetivo en kg', example: 70.0 })
    @IsOptional()
    @IsNumber()
    @Min(30)
    @Max(300)
    weightGoalKg?: number;

    @ApiPropertyOptional({ description: 'Idioma preferido', example: 'es', default: 'es' })
    @IsOptional()
    @IsEnum(['es', 'en'])
    language?: 'es' | 'en';
}

export class SetAllergensDto {
    @ApiProperty({ description: 'IDs de alérgenos', example: ['uuid1', 'uuid2'] })
    @IsArray()
    @IsString({ each: true })
    allergenIds!: string[];
}

export class ProfileResponseDto {
    @ApiProperty()
    id!: string;

    @ApiPropertyOptional()
    username?: string;



    @ApiProperty()
    age!: number;

    @ApiProperty({ enum: Sex })
    sex!: Sex;

    @ApiProperty()
    weightKg!: number;

    @ApiProperty()
    heightCm!: number;

    @ApiProperty({ enum: ActivityLevel })
    activityLevel!: ActivityLevel;

    @ApiProperty()
    mealsPerDay!: number;

    @ApiProperty({ enum: DietPattern })
    dietPattern!: DietPattern;

    @ApiPropertyOptional()
    weightGoalKg?: number;

    @ApiProperty()
    language!: 'es' | 'en';

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}

export class AllergenDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiPropertyOptional()
    description?: string;
}
