import { Injectable } from '@nestjs/common';
import { IngredientsRepository } from './ingredients.repository';
import {
    CreateIngredientDto,
    UpdateIngredientDto,
    IngredientResponseDto,
    IngredientQueryDto,
} from './dto';
import { IngredientCategory } from '@nutriflow/shared';

@Injectable()
export class IngredientsService {
    constructor(private readonly repository: IngredientsRepository) { }

    async findAll(query: IngredientQueryDto): Promise<IngredientResponseDto[]> {
        return this.repository.findAll(query);
    }

    async findById(id: string): Promise<IngredientResponseDto | null> {
        return this.repository.findById(id);
    }

    async findByIds(ids: string[]): Promise<IngredientResponseDto[]> {
        return this.repository.findByIds(ids);
    }

    async create(dto: CreateIngredientDto): Promise<IngredientResponseDto> {
        return this.repository.create(dto);
    }

    async update(id: string, dto: UpdateIngredientDto): Promise<IngredientResponseDto> {
        return this.repository.update(id, dto);
    }

    async delete(id: string): Promise<void> {
        return this.repository.delete(id);
    }

    getCategories(): string[] {
        return Object.values(IngredientCategory);
    }

    /**
     * Find ingredients safe for a user based on their allergens and diet pattern
     */
    async findCompatible(
        excludeAllergenIds: string[],
        dietPattern: string,
        category?: IngredientCategory,
    ): Promise<IngredientResponseDto[]> {
        return this.repository.findCompatible(excludeAllergenIds, dietPattern, category);
    }
}
