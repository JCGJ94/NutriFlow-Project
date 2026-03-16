type SupabaseEnv = {
    url: string;
    key: string;
};

export function getSupabaseEnv(): SupabaseEnv {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        throw new Error("Supabase URL and Key are required to create a Supabase client.");
    }

    return { url, key };
}
