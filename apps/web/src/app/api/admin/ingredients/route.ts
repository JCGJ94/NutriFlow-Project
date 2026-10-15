import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireAdminRole, ApiError } from '@/lib/auth/guards';
import { z } from 'zod';
import { IngredientCategory } from '@nutriflow/shared';

// ---- Zod schema --------------------------------------------------------

const CreateIngredientSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    category: z.nativeEnum(IngredientCategory),
    kcalPer100g: z.number().min(0).max(1000),
    proteinPer100g: z.number().min(0),
    carbsPer100g: z.number().min(0),
    fatPer100g: z.number().min(0),
    fiberPer100g: z.number().min(0).optional(),
    isVegan: z.boolean().optional(),
    isVegetarian: z.boolean().optional(),
    allergenIds: z.array(z.string()).optional(),
    nameEn: z.string().optional(),
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

// ---- GET /api/admin/ingredients ----------------------------------------

export async function GET(_req: NextRequest): Promise<NextResponse> {
    try {
        const sb = await createClient();
        await requireAdminRole(sb);

        const adminSb = getSupabaseAdmin();

        const { data, error } = await adminSb
            .from('ingredients')
            .select('*')
            .order('name');

        if (error) {
            throw new Error(`Failed to fetch ingredients: ${error.message}`);
        }

        return NextResponse.json((data ?? []).map(mapIngredient));
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('GET /api/admin/ingredients error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// ---- POST /api/admin/ingredients ---------------------------------------

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const sb = await createClient();
        await requireAdminRole(sb);

        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const parsed = CreateIngredientSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parsed.error.errors },
                { status: 400 },
            );
        }

        const dto = parsed.data;
        const adminSb = getSupabaseAdmin();

        const { data, error } = await adminSb
            .from('ingredients')
            .insert({
                name: dto.name,
                name_en: dto.nameEn,
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
            const allergenRows = dto.allergenIds.map((allergenId) => ({
                ingredient_id: (data as any).id,
                allergen_id: allergenId,
            }));
            await adminSb.from('ingredient_allergens').insert(allergenRows);
        }

        return NextResponse.json(mapIngredient(data as Record<string, any>), { status: 201 });
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('POST /api/admin/ingredients error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
