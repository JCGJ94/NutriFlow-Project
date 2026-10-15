type SupabaseEnv = {
    url: string;
    key: string;
};

export function getSupabaseEnv(): SupabaseEnv {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        // Durante el build de Next.js (prerendering), es posible que las variables no estén disponibles.
        // Permitimos placeholders para evitar que el build falle si no estamos en runtime real.
        const isBuildStep = process.env.NODE_ENV === 'production' && typeof window === 'undefined';
        
        if (isBuildStep) {
            return {
                url: 'https://placeholder-project.supabase.co',
                key: 'undefined-key-during-build'
            };
        }

        throw new Error("Supabase URL and Key are required to create a Supabase client.");
    }

    return { url: url as string, key: key as string };
}


