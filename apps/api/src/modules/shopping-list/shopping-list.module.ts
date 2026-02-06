import { Module } from '@nestjs/common';
import { ShoppingListService } from './shopping-list.service';
import { ShoppingListRepository } from './shopping-list.repository';
import { PlansModule } from '../plans/plans.module';
import { ShoppingListController } from './shopping-list.controller';

@Module({
    imports: [PlansModule],
    controllers: [ShoppingListController],
    providers: [ShoppingListService, ShoppingListRepository],
    exports: [ShoppingListService],
})
export class ShoppingListModule { }
