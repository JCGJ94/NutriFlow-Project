import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { IngredientsModule } from '../ingredients/ingredients.module';

@Module({
    imports: [IngredientsModule],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }
