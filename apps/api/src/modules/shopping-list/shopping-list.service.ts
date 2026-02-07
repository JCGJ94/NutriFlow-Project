import { Injectable } from '@nestjs/common';
import { ShoppingListRepository, ShoppingListDto } from './shopping-list.repository';

@Injectable()
export class ShoppingListService {
    constructor(private readonly repository: ShoppingListRepository) { }

    async getForPlan(planId: string): Promise<ShoppingListDto> {
        return this.repository.getForPlan(planId);
    }

    async toggleItem(itemId: string, isChecked: boolean): Promise<void> {
        return this.repository.toggleItem(itemId, isChecked);
    }

    async removeItem(itemId: string): Promise<void> {
        return this.repository.removeItem(itemId);
    }

    async addItem(planId: string, item: { ingredientId?: string; customName?: string; grams?: number }): Promise<void> {
        return this.repository.addItem(planId, item);
    }
}
