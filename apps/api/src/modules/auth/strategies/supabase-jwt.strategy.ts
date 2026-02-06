import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../../config/supabase.module';

export interface JwtPayload {
    sub: string; // user id (auth.users.id)
    email?: string;
    role?: string;
    aud: string;
    exp: number;
    iat: number;
}

export interface AuthUser {
    id: string;
    email?: string;
    role: string;
}

@Injectable()
export class SupabaseJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        configService: ConfigService,
        @Inject(SUPABASE_ADMIN) private readonly supabaseAdmin: SupabaseClient
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('SUPABASE_JWT_SECRET') || 'temporary-placeholder',
        });
    }

    /**
     * Overriding the authenticate method to use Supabase API directly
     * This bypasses the need for the correct SUPABASE_JWT_SECRET for local verification
     */
    async validate(payload: any): Promise<AuthUser> {
        // payload comes from the library's decoding, but we want to be sure
        // However, instead of relying on the library's verification (which needs the secret),
        // we will perform a secondary check OR just use the payload if we trust the secret.
        // GIVEN THE 401 ERRORS: We will use the secret-less approach inside a custom guard if needed,
        // but for now, let's just log and try to use what we have.

        console.log('🔍 Validating user ID:', payload.sub);
        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role || 'user',
        };
    }

    // Custom verify function to use Supabase SDK
    async authenticate(req: any) {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        if (!token) {
            return this.fail('Missing token', 401);
        }

        try {
            const { data: { user }, error } = await this.supabaseAdmin.auth.getUser(token);

            if (error || !user) {
                console.error('❌ Supabase Token Validation Failed:', error?.message);
                return this.fail('Invalid token', 401);
            }

            console.log('✅ Supabase Token Validated for:', user.email);
            const authUser: AuthUser = {
                id: user.id,
                email: user.email,
                role: user.role || 'authenticated',
            };

            return this.success(authUser);
        } catch (err) {
            console.error('💥 Auth Strategy Error:', err);
            return this.fail(err, 401);
        }
    }
}
