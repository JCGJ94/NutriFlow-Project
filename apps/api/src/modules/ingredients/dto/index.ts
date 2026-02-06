import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IngredientCategory } from '@nutriflow/shared';

export class CreateIngredientDto {
    @ApiProperty({ description: 'Nombre del ingrediente', example: 'Pechuga de pollo' })
    @IsString()
    name!: string;

    @ApiProperty({ enum: IngredientCategory, description: 'Categoría del ingrediente' })
    @IsEnum(IngredientCategory)
    category!: IngredientCategory;

    @ApiProperty({ description: 'Calorías por 100g', example: 165 })
    @IsNumber()
    @Min(0)
    @Max(1000)
    kcalPer100g!: number;

    @ApiProperty({ description: 'Proteína por 100g', example: 31 })
    @IsNumber()
    @Min(0)
    proteinPer100g!: number;

    @ApiProperty({ description: 'Carbohidratos por 100g', example: 0 })
    @IsNumber()
    @Min(0)
    carbsPer100g!: number;

    @ApiProperty({ description: 'Grasa por 100g', example: 3.6 })
    @IsNumber()
    @Min(0)
    fatPer100g!: number;

    @ApiPropertyOptional({ description: 'Fibra por 100g', example: 0, default: 0 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    fiberPer100g?: number;

    @ApiPropertyOptional({ description: 'Es vegano', example: false, default: false })
    @IsOptional()
    @IsBoolean()
    isVegan?: boolean;

    @ApiPropertyOptional({ description: 'Es vegetariano', example: false, default: false })
    @IsOptional()
    @IsBoolean()
    isVegetarian?: boolean;

    @ApiPropertyOptional({ description: 'IDs de alérgenos asociados', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allergenIds?: string[];
}

export class UpdateIngredientDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ enum: IngredientCategory })
    @IsOptional()
    @IsEnum(IngredientCategory)
    category?: IngredientCategory;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(0)
    kcalPer100g?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(0)
    proteinPer100g?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(0)
    carbsPer100g?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(0)
    fatPer100g?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(0)
    fiberPer100g?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isVegan?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isVegetarian?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allergenIds?: string[];
}

export class IngredientResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty({ enum: IngredientCategory })
    category!: IngredientCategory;

    @ApiProperty()
    kcalPer100g!: number;

    @ApiProperty()
    proteinPer100g!: number;

    @ApiProperty()
    carbsPer100g!: number;

    @ApiProperty()
    fatPer100g!: number;

    @ApiProperty()
    fiberPer100g!: number;

    @ApiProperty()
    isVegan!: boolean;

    @ApiProperty()
    isVegetarian!: boolean;

    @ApiPropertyOptional({ type: [String] })
    allergenIds?: string[];

    @ApiProperty()
    createdAt!: Date;
}

export class IngredientQueryDto {
    @ApiPropertyOptional({ enum: IngredientCategory, description: 'Filtrar por categoría' })
    @IsOptional()
    @IsEnum(IngredientCategory)
    category?: IngredientCategory;

    @ApiPropertyOptional({ description: 'Buscar por nombre' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Solo veganos' })
    @IsOptional()
    @IsBoolean()
    isVegan?: boolean;

    @ApiPropertyOptional({ description: 'Solo vegetarianos' })
    @IsOptional()
    @IsBoolean()
    isVegetarian?: boolean;
}
