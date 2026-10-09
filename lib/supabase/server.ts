import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/config";

export async function crearClienteServidor() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Llamado desde un Server Component: el middleware se encarga de refrescar la sesión.
        }
      },
    },
  });
}

/** Devuelve el usuario si inició sesión y es administrador; si no, null. */
export async function obtenerAdmin() {
  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { supabase, user: null, esAdmin: false };
  const { data: esAdmin } = await supabase.rpc("es_admin");
  return { supabase, user: data.user, esAdmin: esAdmin === true };
}
