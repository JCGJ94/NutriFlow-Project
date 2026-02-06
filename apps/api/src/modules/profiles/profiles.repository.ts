import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../config/supabase.module';
import { UpsertProfileDto, ProfileResponseDto, AllergenDto } from './dto';
import { DietPattern } from '@nutriflow/shared';

@Injectable()
export class ProfilesRepository {
    constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) { }

    async findByUserId(userId: string): Promise<ProfileResponseDto | null> {
        const { data, error } = await this.supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !data) {
            return null;
        }

        return this.mapToDto(data);
    }

    async create(userId: string, dto: UpsertProfileDto): Promise<ProfileResponseDto> {
        const { data, error } = await this.supabase
            .from('profiles')
            .insert({
                id: userId, // auth.users.id
                username: dto.username,
                age: dto.age,

                sex: dto.sex,
                weight_kg: dto.weightKg,
                height_cm: dto.heightCm,
                activity_level: dto.activityLevel,
                meals_per_day: dto.mealsPerDay ?? 3,
                diet_pattern: dto.dietPattern ?? DietPattern.OMNIVORE,
                weight_goal_kg: dto.weightGoalKg,
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create profile: ${error.message}`);
        }

        return this.mapToDto(data);
    }

    async update(userId: string, dto: UpsertProfileDto): Promise<ProfileResponseDto> {
        const { data, error } = await this.supabase
            .from('profiles')
            .update({
                username: dto.username,
                age: dto.age,

                sex: dto.sex,
                weight_kg: dto.weightKg,
                height_cm: dto.heightCm,
                activity_level: dto.activityLevel,
                meals_per_day: dto.mealsPerDay,
                diet_pattern: dto.dietPattern,
                weight_goal_kg: dto.weightGoalKg,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update profile: ${error.message}`);
        }

        return this.mapToDto(data);
    }

    async findUserAllergens(userId: string): Promise<AllergenDto[]> {
        const { data, error } = await this.supabase
            .from('profile_allergens')
            .select(`
        allergen_id,
        allergens (
          id,
          name,
          description
        )
      `)
            .eq('profile_id', userId);

        if (error) {
            throw new Error(`Failed to fetch allergens: ${error.message}`);
        }

        return (data || []).map((row: any) => ({
            id: row.allergens.id,
            name: row.allergens.name,
            description: row.allergens.description,
        }));
    }

    async setUserAllergens(userId: string, allergenIds: string[]): Promise<void> {
        // Delete existing allergens
        await this.supabase
            .from('profile_allergens')
            .delete()
            .eq('profile_id', userId);

        // Insert new allergens
        if (allergenIds.length > 0) {
            const rows = allergenIds.map((allergenId) => ({
                profile_id: userId,
                allergen_id: allergenId,
            }));

            const { error } = await this.supabase
                .from('profile_allergens')
                .insert(rows);

            if (error) {
                throw new Error(`Failed to set allergens: ${error.message}`);
            }
        }
    }

    async findAllAllergens(): Promise<AllergenDto[]> {
        const { data, error } = await this.supabase
            .from('allergens')
            .select('*');

        if (error) {
            throw new Error(`Failed to fetch all allergens: ${error.message}`);
        }

        return (data || []).map((row: any) => ({
            id: row.id,
            name: row.name,
            description: row.description,
        }));
    }

    private mapToDto(data: any): ProfileResponseDto {
        return {
            id: data.id,
            username: data.username,

            age: data.age,
            sex: data.sex,
            weightKg: data.weight_kg,
            heightCm: data.height_cm,
            activityLevel: data.activity_level,
            mealsPerDay: data.meals_per_day,
            dietPattern: data.diet_pattern,
            weightGoalKg: data.weight_goal_kg,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    }
}
