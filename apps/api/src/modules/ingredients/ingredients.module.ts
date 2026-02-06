import { Module } from '@nestjs/common';
import { IngredientsController } from './ingredients.controller';
import { IngredientsService } from './ingredients.service';
import { IngredientsRepository } from './ingredients.repository';

@Module({
    controllers: [IngredientsController],
    providers: [IngredientsService, IngredientsRepository],
    exports: [IngredientsService, IngredientsRepository],
})
export class IngredientsModule { }
