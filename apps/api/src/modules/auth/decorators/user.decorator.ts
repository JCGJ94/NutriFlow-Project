import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../strategies/supabase-jwt.strategy';

/**
 * Custom decorator to extract the current user from the request
 * Usage: @User() user: AuthUser
 * 
 * The user.id is the auth.users.id from Supabase Auth
 */
export const User = createParamDecorator(
    (data: keyof AuthUser | undefined, ctx: ExecutionContext): AuthUser | string | undefined => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user as AuthUser;

        if (data) {
            return user?.[data];
        }

        return user;
    },
);
