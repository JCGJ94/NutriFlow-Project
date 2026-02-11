import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../config/supabase.module';
import { ShoppingListRepository, ShoppingListDto, ShoppingListItemDto } from './shopping-list.repository';

@Injectable()
export class ShoppingListService {
    constructor(
        private readonly repository: ShoppingListRepository,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient // Need this for quick lookups
    ) { }

    private getCacheKey(planId: string): string {
        return `shopping_list:${planId}`;
    }

    private async getPlanIdByItemId(itemId: string): Promise<string | null> {
        const { data, error } = await this.supabase
            .from('shopping_list_items')
            .select('shopping_lists (plan_id)')
            .eq('id', itemId)
            .single();

        if (error || !data) return null;
        return (data.shopping_lists as any)?.plan_id;
    }

    async getForPlan(planId: string): Promise<ShoppingListDto> {
        const key = this.getCacheKey(planId);
        const cached = await this.cacheManager.get<ShoppingListDto>(key);
        if (cached) return cached;

        const list = await this.repository.getForPlan(planId);
        await this.cacheManager.set(key, list, 86400000); // 24h
        return list;
    }

    async toggleItem(itemId: string, isChecked: boolean): Promise<void> {
        await this.repository.toggleItem(itemId, isChecked);
        const planId = await this.getPlanIdByItemId(itemId);
        if (planId) await this.cacheManager.del(this.getCacheKey(planId));
    }

    async removeItem(itemId: string): Promise<void> {
        const planId = await this.getPlanIdByItemId(itemId);
        await this.repository.removeItem(itemId);
        if (planId) await this.cacheManager.del(this.getCacheKey(planId));
    }

    async addItem(planId: string, item: { ingredientId?: string; customName?: string; grams?: number }): Promise<ShoppingListItemDto> {
        const result = await this.repository.addItem(planId, item);
        await this.cacheManager.del(this.getCacheKey(planId));
        return result;
    }
}
