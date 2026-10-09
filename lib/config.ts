export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Sin Supabase configurado el sitio muestra productos de ejemplo (modo demostración). */
export const supabaseConfigurado = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
