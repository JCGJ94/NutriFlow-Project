import { Controller, Get, Put, Body, UseGuards, Param } from '@nestjs/common';
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
        try {
            console.log('Getting profile for user:', user.id);
            const profile = await this.profilesService.getProfile(user.id);
            console.log('Profile found:', profile ? 'yes' : 'no');
            return profile;
        } catch (error) {
            console.error('Error in getProfile:', error);
            // Emergency file logging
            try {
                const fs = require('fs');
                const path = require('path');
                const logPath = path.resolve('api-error.log');
                const errorMessage = error instanceof Error ? error.stack : JSON.stringify(error);
                fs.appendFileSync(logPath, `\n[${new Date().toISOString()}] Error in getProfile: ${errorMessage}\n`);
            } catch (p) { console.error('Failed to write log file', p) }

            throw error;
        }
    }

    @Get('check-username/:username')
    @ApiOperation({ summary: 'Verificar si un nombre de usuario está disponible' })
    @ApiResponse({ status: 200, type: Boolean })
    async checkUsername(@Body() _dto: any, @User() _user: AuthUser, @Param('username') username: string): Promise<boolean> {
        return this.profilesService.isUsernameAvailable(username);
    }

    @Put('profile')
    @ApiOperation({ summary: 'Crear o actualizar perfil del usuario' })
    @ApiResponse({ status: 200, type: ProfileResponseDto })
    async upsertProfile(
        @User() user: AuthUser,
        @Body() dto: UpsertProfileDto,
    ): Promise<ProfileResponseDto> {
        try {
            return await this.profilesService.upsertProfile(user.id, dto);
        } catch (error) {
            console.error('Error in upsertProfile controller:', error);
            if (error instanceof Error) {
                console.error('Stack:', error.stack);
            }
            throw error; // Rethrow to let global filter handle it, but now we have logs
        }
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
