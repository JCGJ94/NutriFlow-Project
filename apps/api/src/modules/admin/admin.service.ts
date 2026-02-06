import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../config/supabase.module';
import { IngredientsService } from '../ingredients/ingredients.service';
import {
    CreateIngredientDto,
    UpdateIngredientDto,
    IngredientResponseDto,
} from '../ingredients/dto';
import { AllergenDto } from '../profiles/dto';

@Injectable()
export class AdminService {
    constructor(
        @Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient,
        private readonly ingredientsService: IngredientsService,
    ) { }

    // ---- Ingredients ----

    async createIngredient(dto: CreateIngredientDto): Promise<IngredientResponseDto> {
        return this.ingredientsService.create(dto);
    }

    async updateIngredient(id: string, dto: UpdateIngredientDto): Promise<IngredientResponseDto> {
        return this.ingredientsService.update(id, dto);
    }

    async deleteIngredient(id: string): Promise<void> {
        return this.ingredientsService.delete(id);
    }

    // ---- Allergens ----

    async getAllergens(): Promise<AllergenDto[]> {
        const { data, error } = await this.supabase
            .from('allergens')
            .select('*')
            .order('name');

        if (error) {
            throw new Error(`Failed to fetch allergens: ${error.message}`);
        }

        return (data || []).map((a) => ({
            id: a.id,
            name: a.name,
            description: a.description,
        }));
    }

    async createAllergen(name: string, description?: string): Promise<AllergenDto> {
        const { data, error } = await this.supabase
            .from('allergens')
            .insert({ name, description })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create allergen: ${error.message}`);
        }

        return {
            id: data.id,
            name: data.name,
            description: data.description,
        };
    }

    async updateAllergen(
        id: string,
        dto: { name?: string; description?: string },
    ): Promise<AllergenDto> {
        const { data, error } = await this.supabase
            .from('allergens')
            .update(dto)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update allergen: ${error.message}`);
        }

        return {
            id: data.id,
            name: data.name,
            description: data.description,
        };
    }
}
