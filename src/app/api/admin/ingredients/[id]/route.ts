import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireAdminRole, ApiError } from '@/lib/auth/guards';
import { z } from 'zod';
import { IngredientCategory } from '@/lib/contracts';

type RouteContext = { params: Promise<{ id: string }> };

// ---- Zod schema --------------------------------------------------------

const UpdateIngredientSchema = z.object({
    name: z.string().optional(),
    nameEn: z.string().optional(),
    category: z.nativeEnum(IngredientCategory).optional(),
    kcalPer100g: z.number().min(0).max(1000).optional(),
    proteinPer100g: z.number().min(0).optional(),
    carbsPer100g: z.number().min(0).optional(),
    fatPer100g: z.number().min(0).optional(),
    fiberPer100g: z.number().min(0).optional(),
    isVegan: z.boolean().optional(),
    isVegetarian: z.boolean().optional(),
    allergenIds: z.array(z.string()).optional(),
});

// ---- DB → DTO mapping --------------------------------------------------

function mapIngredient(data: Record<string, any>) {
    return {
        id: data.id,
        name: data.name,
        nameEn: data.name_en,
        category: data.category,
        kcalPer100g: data.kcal_per_100g,
        proteinPer100g: data.protein_per_100g,
        carbsPer100g: data.carbs_per_100g,
        fatPer100g: data.fat_per_100g,
        fiberPer100g: data.fiber_per_100g,
        isVegan: data.is_vegan,
        isVegetarian: data.is_vegetarian,
        createdAt: data.created_at,
    };
}

// ---- PUT /api/admin/ingredients/[id] -----------------------------------

export async function PUT(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
    try {
        const { id } = await params;
        const sb = await createClient();
        await requireAdminRole(sb);

        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const parsed = UpdateIngredientSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parsed.error.errors },
                { status: 400 },
            );
        }

        const dto = parsed.data;
        const adminSb = getSupabaseAdmin();

        const updateData: Record<string, any> = {};
        if (dto.name !== undefined) updateData.name = dto.name;
        if (dto.nameEn !== undefined) updateData.name_en = dto.nameEn;
        if (dto.category !== undefined) updateData.category = dto.category;
        if (dto.kcalPer100g !== undefined) updateData.kcal_per_100g = dto.kcalPer100g;
        if (dto.proteinPer100g !== undefined) updateData.protein_per_100g = dto.proteinPer100g;
        if (dto.carbsPer100g !== undefined) updateData.carbs_per_100g = dto.carbsPer100g;
        if (dto.fatPer100g !== undefined) updateData.fat_per_100g = dto.fatPer100g;
        if (dto.fiberPer100g !== undefined) updateData.fiber_per_100g = dto.fiberPer100g;
        if (dto.isVegan !== undefined) updateData.is_vegan = dto.isVegan;
        if (dto.isVegetarian !== undefined) updateData.is_vegetarian = dto.isVegetarian;

        const { data, error } = await adminSb
            .from('ingredients')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
            }
            throw new Error(`Failed to update ingredient: ${error.message}`);
        }

        // Update allergens if provided
        if (dto.allergenIds !== undefined) {
            await adminSb.from('ingredient_allergens').delete().eq('ingredient_id', id);
            if (dto.allergenIds.length > 0) {
                const rows = dto.allergenIds.map((allergenId) => ({
                    ingredient_id: id,
                    allergen_id: allergenId,
                }));
                await adminSb.from('ingredient_allergens').insert(rows);
            }
        }

        return NextResponse.json(mapIngredient(data as Record<string, any>));
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('PUT /api/admin/ingredients/[id] error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// ---- DELETE /api/admin/ingredients/[id] --------------------------------

export async function DELETE(_req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
    try {
        const { id } = await params;
        const sb = await createClient();
        await requireAdminRole(sb);

        const adminSb = getSupabaseAdmin();

        const { error } = await adminSb
            .from('ingredients')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete ingredient: ${error.message}`);
        }

        return new NextResponse(null, { status: 204 });
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('DELETE /api/admin/ingredients/[id] error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
