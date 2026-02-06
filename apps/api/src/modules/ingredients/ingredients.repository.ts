import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../config/supabase.module';
import {
    CreateIngredientDto,
    UpdateIngredientDto,
    IngredientResponseDto,
    IngredientQueryDto,
} from './dto';
import { IngredientCategory, DietPattern } from '@nutriflow/shared';

@Injectable()
export class IngredientsRepository {
    constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) { }

    async findAll(query: IngredientQueryDto): Promise<IngredientResponseDto[]> {
        let request = this.supabase.from('ingredients').select('*');

        if (query.category) {
            request = request.eq('category', query.category);
        }

        if (query.search) {
            request = request.ilike('name', `%${query.search}%`);
        }

        if (query.isVegan !== undefined) {
            request = request.eq('is_vegan', query.isVegan);
        }

        if (query.isVegetarian !== undefined) {
            request = request.eq('is_vegetarian', query.isVegetarian);
        }

        const { data, error } = await request.order('name');

        if (error) {
            throw new Error(`Failed to fetch ingredients: ${error.message}`);
        }

        return (data || []).map(this.mapToDto);
    }

    async findById(id: string): Promise<IngredientResponseDto | null> {
        const { data, error } = await this.supabase
            .from('ingredients')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            return null;
        }

        return this.mapToDto(data);
    }

    async findByIds(ids: string[]): Promise<IngredientResponseDto[]> {
        const { data, error } = await this.supabase
            .from('ingredients')
            .select('*')
            .in('id', ids);

        if (error) {
            throw new Error(`Failed to fetch ingredients: ${error.message}`);
        }

        return (data || []).map(this.mapToDto);
    }

    async create(dto: CreateIngredientDto): Promise<IngredientResponseDto> {
        const { data, error } = await this.supabase
            .from('ingredients')
            .insert({
                name: dto.name,
                category: dto.category,
                kcal_per_100g: dto.kcalPer100g,
                protein_per_100g: dto.proteinPer100g,
                carbs_per_100g: dto.carbsPer100g,
                fat_per_100g: dto.fatPer100g,
                fiber_per_100g: dto.fiberPer100g ?? 0,
                is_vegan: dto.isVegan ?? false,
                is_vegetarian: dto.isVegetarian ?? false,
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create ingredient: ${error.message}`);
        }

        // Set allergens if provided
        if (dto.allergenIds && dto.allergenIds.length > 0) {
            await this.setIngredientAllergens(data.id, dto.allergenIds);
        }

        return this.mapToDto(data);
    }

    async update(id: string, dto: UpdateIngredientDto): Promise<IngredientResponseDto> {
        const updateData: any = {};

        if (dto.name !== undefined) updateData.name = dto.name;
        if (dto.category !== undefined) updateData.category = dto.category;
        if (dto.kcalPer100g !== undefined) updateData.kcal_per_100g = dto.kcalPer100g;
        if (dto.proteinPer100g !== undefined) updateData.protein_per_100g = dto.proteinPer100g;
        if (dto.carbsPer100g !== undefined) updateData.carbs_per_100g = dto.carbsPer100g;
        if (dto.fatPer100g !== undefined) updateData.fat_per_100g = dto.fatPer100g;
        if (dto.fiberPer100g !== undefined) updateData.fiber_per_100g = dto.fiberPer100g;
        if (dto.isVegan !== undefined) updateData.is_vegan = dto.isVegan;
        if (dto.isVegetarian !== undefined) updateData.is_vegetarian = dto.isVegetarian;

        const { data, error } = await this.supabase
            .from('ingredients')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update ingredient: ${error.message}`);
        }

        if (dto.allergenIds !== undefined) {
            await this.setIngredientAllergens(id, dto.allergenIds);
        }

        return this.mapToDto(data);
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('ingredients')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete ingredient: ${error.message}`);
        }
    }

    async findCompatible(
        excludeAllergenIds: string[],
        dietPattern: string,
        category?: IngredientCategory,
    ): Promise<IngredientResponseDto[]> {
        let request = this.supabase.from('ingredients').select('*');

        // Filter by diet pattern
        if (dietPattern === DietPattern.VEGAN) {
            request = request.eq('is_vegan', true);
        } else if (dietPattern === DietPattern.VEGETARIAN) {
            request = request.eq('is_vegetarian', true);
        }

        if (category) {
            request = request.eq('category', category);
        }

        const { data, error } = await request.order('name');

        if (error) {
            throw new Error(`Failed to fetch ingredients: ${error.message}`);
        }

        // If we need to exclude allergens, fetch ingredient allergens
        if (excludeAllergenIds.length === 0) {
            return (data || []).map(this.mapToDto);
        }

        // Get all ingredient-allergen relationships for these ingredients
        const ingredientIds = (data || []).map((i) => i.id);
        const { data: allergenData } = await this.supabase
            .from('ingredient_allergens')
            .select('ingredient_id, allergen_id')
            .in('ingredient_id', ingredientIds)
            .in('allergen_id', excludeAllergenIds);

        const excludedIngredientIds = new Set(
            (allergenData || []).map((r) => r.ingredient_id),
        );

        return (data || [])
            .filter((i) => !excludedIngredientIds.has(i.id))
            .map(this.mapToDto);
    }

    private async setIngredientAllergens(
        ingredientId: string,
        allergenIds: string[],
    ): Promise<void> {
        // Delete existing
        await this.supabase
            .from('ingredient_allergens')
            .delete()
            .eq('ingredient_id', ingredientId);

        // Insert new
        if (allergenIds.length > 0) {
            const rows = allergenIds.map((allergenId) => ({
                ingredient_id: ingredientId,
                allergen_id: allergenId,
            }));

            await this.supabase.from('ingredient_allergens').insert(rows);
        }
    }

    private mapToDto(data: any): IngredientResponseDto {
        return {
            id: data.id,
            name: data.name,
            category: data.category,
            kcalPer100g: data.kcal_per_100g,
            proteinPer100g: data.protein_per_100g,
            carbsPer100g: data.carbs_per_100g,
            fatPer100g: data.fat_per_100g,
            fiberPer100g: data.fiber_per_100g,
            isVegan: data.is_vegan,
            isVegetarian: data.is_vegetarian,
            createdAt: new Date(data.created_at),
        };
    }
}
