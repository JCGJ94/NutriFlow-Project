import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { UpsertProfileDto, SetAllergensDto, ProfileResponseDto, AllergenDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { AuthUser } from '../auth/strategies/supabase-jwt.strategy';

@ApiTags('profiles')
@ApiBearerAuth('supabase-auth')
@UseGuards(JwtAuthGuard)
@Controller('me')
export class ProfilesController {
    constructor(private readonly profilesService: ProfilesService) { }

    @Get('profile')
    @ApiOperation({ summary: 'Obtener perfil del usuario actual' })
    @ApiResponse({ status: 200, type: ProfileResponseDto })
    async getProfile(@User() user: AuthUser): Promise<ProfileResponseDto | null> {
        return this.profilesService.getProfile(user.id);
    }

    @Put('profile')
    @ApiOperation({ summary: 'Crear o actualizar perfil del usuario' })
    @ApiResponse({ status: 200, type: ProfileResponseDto })
    async upsertProfile(
        @User() user: AuthUser,
        @Body() dto: UpsertProfileDto,
    ): Promise<ProfileResponseDto> {
        return this.profilesService.upsertProfile(user.id, dto);
    }

    @Get('allergens')
    @ApiOperation({ summary: 'Obtener alérgenos del usuario' })
    @ApiResponse({ status: 200, type: [AllergenDto] })
    async getAllergens(@User() user: AuthUser): Promise<AllergenDto[]> {
        return this.profilesService.getAllergens(user.id);
    }

    @Put('allergens')
    @ApiOperation({ summary: 'Establecer alérgenos del usuario' })
    @ApiResponse({ status: 200, type: [AllergenDto] })
    async setAllergens(
        @User() user: AuthUser,
        @Body() dto: SetAllergensDto,
    ): Promise<AllergenDto[]> {
        return this.profilesService.setAllergens(user.id, dto.allergenIds);
    }
}

// Separate controller for public/common configuration to avoid route conflict or auth issues
// Ideally this should go to a ConfigurationModule, but putting it here for speed
@ApiTags('common')
@Controller('allergens')
export class AllergensCommonController {
    constructor(private readonly profilesService: ProfilesService) { }

    @Get()
    @ApiOperation({ summary: 'Listar todos los alérgenos disponibles' })
    @ApiResponse({ status: 200, type: [AllergenDto] })
    async findAll() {
        return this.profilesService.findAllAllergens();
    }
}
