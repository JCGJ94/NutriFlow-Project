import { Controller, Get, Param, Post, Body, Delete } from '@nestjs/common';
import { ShoppingListService } from './shopping-list.service';

@Controller('shopping-list')
export class ShoppingListController {
    constructor(private readonly shoppingListService: ShoppingListService) { }

    @Get(':planId')
    async getShoppingList(@Param('planId') planId: string) {
        return this.shoppingListService.getForPlan(planId);
    }

    @Post('items/toggle')
    async toggleItem(@Body() body: { itemId: string; isChecked: boolean }) {
        return this.shoppingListService.toggleItem(body.itemId, body.isChecked);
    }

    @Delete('items/:itemId')
    async removeItem(@Param('itemId') itemId: string) {
        return this.shoppingListService.removeItem(itemId);
    }

    @Post(':planId/items')
    async addItem(
        @Param('planId') planId: string,
        @Body() body: { ingredientId?: string; customName?: string; grams?: number },
    ) {
        return this.shoppingListService.addItem(planId, body);
    }
}
