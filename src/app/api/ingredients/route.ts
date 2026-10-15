import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser, ApiError } from '@/lib/auth/guards';

function mapIngredient(data: Record<string, unknown>) {
    return {
        id: data.id,
        name: data.name,
        nameEn: data.name_en ?? null,
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

/**
 * GET /api/ingredients
 * Auth required. Optional ?category= filter.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const sb = await createClient();
        await requireUser(sb);

        const { searchParams } = req.nextUrl;
        const category = searchParams.get('category');

        let query = sb.from('ingredients').select('*');

        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query.order('name');

        if (error) {
            throw new Error(`Failed to fetch ingredients: ${error.message}`);
        }

        return NextResponse.json((data || []).map((row) => mapIngredient(row as Record<string, unknown>)));
    } catch (err) {
        if (err instanceof ApiError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('GET /api/ingredients error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
