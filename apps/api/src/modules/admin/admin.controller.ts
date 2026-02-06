import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
    CreateIngredientDto,
    UpdateIngredientDto,
    IngredientResponseDto,
} from '../ingredients/dto';
import { AllergenDto } from '../profiles/dto';

@ApiTags('admin')
@ApiBearerAuth('supabase-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // ---- Ingredients ----

    @Post('ingredients')
    @ApiOperation({ summary: 'Crear ingrediente (solo admin)' })
    @ApiResponse({ status: 201, type: IngredientResponseDto })
    async createIngredient(@Body() dto: CreateIngredientDto): Promise<IngredientResponseDto> {
        return this.adminService.createIngredient(dto);
    }

    @Put('ingredients/:id')
    @ApiOperation({ summary: 'Actualizar ingrediente (solo admin)' })
    @ApiResponse({ status: 200, type: IngredientResponseDto })
    async updateIngredient(
        @Param('id') id: string,
        @Body() dto: UpdateIngredientDto,
    ): Promise<IngredientResponseDto> {
        return this.adminService.updateIngredient(id, dto);
    }

    @Delete('ingredients/:id')
    @ApiOperation({ summary: 'Eliminar ingrediente (solo admin)' })
    @ApiResponse({ status: 200 })
    async deleteIngredient(@Param('id') id: string): Promise<void> {
        return this.adminService.deleteIngredient(id);
    }

    // ---- Allergens ----

    @Get('allergens')
    @ApiOperation({ summary: 'Listar todos los alérgenos' })
    @ApiResponse({ status: 200, type: [AllergenDto] })
    async getAllergens(): Promise<AllergenDto[]> {
        return this.adminService.getAllergens();
    }

    @Post('allergens')
    @ApiOperation({ summary: 'Crear alérgeno (solo admin)' })
    @ApiResponse({ status: 201, type: AllergenDto })
    async createAllergen(
        @Body() dto: { name: string; description?: string },
    ): Promise<AllergenDto> {
        return this.adminService.createAllergen(dto.name, dto.description);
    }

    @Put('allergens/:id')
    @ApiOperation({ summary: 'Actualizar alérgeno (solo admin)' })
    @ApiResponse({ status: 200, type: AllergenDto })
    async updateAllergen(
        @Param('id') id: string,
        @Body() dto: { name?: string; description?: string },
    ): Promise<AllergenDto> {
        return this.adminService.updateAllergen(id, dto);
    }
}
