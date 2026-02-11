import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ShoppingListService } from './shopping-list.service';
import { ShoppingListRepository } from './shopping-list.repository';
import { PlansModule } from '../plans/plans.module';
import { ShoppingListController } from './shopping-list.controller';

@Module({
    imports: [PlansModule, CacheModule.register({ ttl: 86400000 })], // 24h default TTL
    controllers: [ShoppingListController],
    providers: [ShoppingListService, ShoppingListRepository],
    exports: [ShoppingListService],
})
export class ShoppingListModule { }
