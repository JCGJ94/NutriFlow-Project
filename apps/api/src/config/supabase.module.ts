import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';
export const SUPABASE_ADMIN = 'SUPABASE_ADMIN';

@Global()
@Module({
    providers: [
        {
            provide: SUPABASE_CLIENT,
            inject: [ConfigService],
            useFactory: (configService: ConfigService): SupabaseClient => {
                const supabaseUrl = configService.get<string>('SUPABASE_URL');
                const supabaseAnonKey = configService.get<string>('SUPABASE_ANON_KEY');

                if (!supabaseUrl || !supabaseAnonKey) {
                    throw new Error('Missing Supabase environment variables');
                }

                return createClient(supabaseUrl, supabaseAnonKey);
            },
        },
        {
            provide: SUPABASE_ADMIN,
            inject: [ConfigService],
            useFactory: (configService: ConfigService): SupabaseClient => {
                const supabaseUrl = configService.get<string>('SUPABASE_URL');
                const supabaseServiceKey = configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || configService.get<string>('SUPABASE_SERVICE_KEY');

                if (!supabaseUrl || !supabaseServiceKey) {
                    throw new Error('Missing Supabase admin environment variables');
                }

                return createClient(supabaseUrl, supabaseServiceKey, {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false,
                    },
                });
            },
        },
    ],
    exports: [SUPABASE_CLIENT, SUPABASE_ADMIN],
})
export class SupabaseModule { }
