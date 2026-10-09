import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigurado } from "@/lib/config";

// Un solo sitio para todas las tiendas:
//   sitio.com/ana/...  → tienda "ana" (por dirección)
//   ana.com/...        → tienda "ana" (dominio propio, se busca en tiendas.dominio)
// También refresca la sesión y protege /admin de cada tienda.

const HOSTS_SIN_DOMINIO = /(^localhost$)|(^127\.0\.0\.1$)|(\.vercel\.app$)/;
const MINUTOS_CACHE = 5;
const dominios = new Map<string, { slug: string | null; hasta: number }>();

async function slugPorDominio(host: string): Promise<string | null> {
  const guardado = dominios.get(host);
  if (guardado && guardado.hasta > Date.now()) return guardado.slug;
  let slug: string | null = null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/tiendas?select=slug&dominio=eq.${encodeURIComponent(host)}&limit=1`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } },
    );
    if (res.ok) {
      const filas = (await res.json()) as { slug: string }[];
      slug = filas[0]?.slug ?? null;
    } else if (guardado) {
      return guardado.slug;
    }
  } catch {
    if (guardado) return guardado.slug;
  }
  dominios.set(host, { slug, hasta: Date.now() + MINUTOS_CACHE * 60_000 });
  return slug;
}

export async function middleware(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase().replace(/^www\./, "");
  const ruta = request.nextUrl.pathname;

  let slug: string | null = null;
  let base = "";
  let rutaInterna = ruta;
  if (supabaseConfigurado && host && !HOSTS_SIN_DOMINIO.test(host)) slug = await slugPorDominio(host);

  if (slug) {
    // Dominio propio: los enlaces no llevan la dirección de la tienda
    rutaInterna = `/${slug}${ruta === "/" ? "" : ruta}`;
  } else {
    const primera = ruta.split("/")[1] ?? "";
    if (primera) base = `/${primera}`;
  }

  const siguiente = () => {
    const cabeceras = new Headers(request.headers);
    cabeceras.set("x-base", base);
    if (rutaInterna === ruta) return NextResponse.next({ request: { headers: cabeceras } });
    const url = request.nextUrl.clone();
    url.pathname = rutaInterna;
    return NextResponse.rewrite(url, { request: { headers: cabeceras } });
  };

  let response = siguiente();
  const zonaAdmin = /^\/[^/]+\/(admin|entrar)(\/|$)/.test(rutaInterna);
  if (!supabaseConfigurado || !zonaAdmin) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = siguiente();
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();

  if (!data.user && /^\/[^/]+\/admin(\/|$)/.test(rutaInterna)) {
    const url = request.nextUrl.clone();
    url.pathname = `${base}/entrar`;
    url.search = "";
    url.host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  // Todo menos archivos internos de Next.js y archivos con extensión (imágenes, íconos)
  matcher: ["/((?!_next/|.*\\.[a-zA-Z0-9]+$).*)"],
};
