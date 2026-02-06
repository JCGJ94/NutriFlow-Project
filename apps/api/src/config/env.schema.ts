import { z } from 'zod';

/**
 * Environment variables schema for validation
 * Use this to ensure all required env vars are present at startup
 */
export const envSchema = z.object({
    // Supabase
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_KEY: z.string().min(1),
    SUPABASE_JWT_SECRET: z.string().min(1),

    // API
    API_PORT: z.string().default('3001'),
    API_PREFIX: z.string().default('api'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Frontend
    FRONTEND_URL: z.string().url().default('http://localhost:3000'),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validates environment variables
 * Call this at application startup to fail fast if config is missing
 */
export function validateEnv(): EnvConfig {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
        throw new Error('Invalid environment variables');
    }

    return parsed.data;
}
