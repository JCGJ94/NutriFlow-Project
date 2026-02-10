import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../config/supabase.module';
import { UpsertProfileDto, ProfileResponseDto, AllergenDto } from './dto';
import { DietPattern } from '@nutriflow/shared';

@Injectable()
export class ProfilesRepository {
    constructor(@Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient) { }

    async findByUserId(userId: string): Promise<ProfileResponseDto | null> {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                // PGRST116 is "The result contains 0 rows" which is expected if profile doesn't exist
                if (error.code !== 'PGRST116') {
                    console.error('Supabase error in findByUserId:', error);
                }
                return null;
            }

            if (!data) {
                return null;
            }

            console.log('Raw profile data found:', data);
            return this.mapToDto(data);
        } catch (err) {
            console.error('Unexpected error in findByUserId:', err);
            throw err;
        }
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
                language: dto.language ?? 'es',
                health_conditions: dto.healthConditions,
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                throw new ConflictException('El nombre de usuario elegido ya está en uso. Por favor, elige otro.');
            }
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
                language: dto.language,
                health_conditions: dto.healthConditions,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                throw new ConflictException('El nombre de usuario elegido ya está en uso. Por favor, elige otro.');
            }
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
        if (!data || !data.id) {
            console.error('Invalid profile data structure:', data);
            throw new Error('Invalid profile data: missing ID');
        }
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
            language: data.language || 'es',
            healthConditions: data.health_conditions,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    }
}
