import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { IngredientsService } from './ingredients.service';
import { IngredientResponseDto, IngredientQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('ingredients')
@ApiBearerAuth('supabase-auth')
@UseGuards(JwtAuthGuard)
@Controller('ingredients')
export class IngredientsController {
    constructor(private readonly ingredientsService: IngredientsService) { }

    @Get()
    @ApiOperation({ summary: 'Listar todos los ingredientes' })
    @ApiResponse({ status: 200, type: [IngredientResponseDto] })
    async findAll(@Query() query: IngredientQueryDto): Promise<IngredientResponseDto[]> {
        return this.ingredientsService.findAll(query);
    }

    @Get('categories')
    @ApiOperation({ summary: 'Listar categorías de ingredientes' })
    @ApiResponse({ status: 200, type: [String] })
    async getCategories(): Promise<string[]> {
        return this.ingredientsService.getCategories();
    }
}
