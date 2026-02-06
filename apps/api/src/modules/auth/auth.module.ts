import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SupabaseJwtStrategy } from './strategies/supabase-jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
    imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
    providers: [SupabaseJwtStrategy, JwtAuthGuard, RolesGuard],
    exports: [PassportModule, JwtAuthGuard, RolesGuard],
})
export class AuthModule { }
