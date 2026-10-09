import { cache } from "react";
import { headers } from "next/headers";
import { supabaseConfigurado } from "./config";
import { categoriasDemo, productosDemo } from "./demo";
import { crearClienteServidor } from "./supabase/server";
import { formatearCelular, numeroWhatsApp } from "./telefono";
import type { Categoria, FilaTienda, Producto, Tienda } from "./types";

const COLUMNAS_PRODUCTO = "id, nombre, descripcion, categoria_id, imagen_url, imagen_path, creado_en";

/**
 * Inicio de los enlaces de la tienda: "/ana" cuando se entra por dirección
 * (sitio.com/ana) y "" cuando se entra por su propio dominio (ana.com).
 * Lo calcula el middleware.
 */
export async function obtenerBase(): Promise<string> {
  return (await headers()).get("x-base") ?? "";
}

function demoTienda(slug: string): FilaTienda {
  return {
    id: 1,
    slug,
    nombre_tienda: "Ferretería",
    logo_url: null,
    logo_path: null,
    codigo_pais: "504",
    celular: "88839869",
    activa: true,
  };
}

/** Fila de la tienda por su dirección. null si no existe. */
export const obtenerFilaTienda = cache(async (slug: string): Promise<FilaTienda | null> => {
  if (!supabaseConfigurado) return demoTienda(slug);
  const supabase = await crearClienteServidor();
  const { data } = await supabase
    .from("tiendas")
    .select("id, slug, nombre_tienda, logo_url, logo_path, codigo_pais, celular, activa")
    .eq("slug", slug)
    .maybeSingle();
  return data;
});

export async function obtenerTienda(slug: string): Promise<Tienda | null> {
  const t = await obtenerFilaTienda(slug);
  if (!t) return null;
  return {
    id: t.id,
    slug: t.slug,
    activa: t.activa,
    nombre: t.nombre_tienda,
    logoUrl: t.logo_url,
    celularFormateado: formatearCelular(t.codigo_pais, t.celular),
    whatsapp: numeroWhatsApp(t.codigo_pais, t.celular),
  };
}

export async function obtenerCatalogo(tiendaId: number): Promise<{ categorias: Categoria[]; productos: Producto[] }> {
  if (!supabaseConfigurado) return { categorias: categoriasDemo, productos: productosDemo };

  const supabase = await crearClienteServidor();
  const [cats, productos] = await Promise.all([
    supabase.from("categorias").select("id, nombre").eq("tienda_id", tiendaId).order("nombre"),
    todosLosProductos(supabase, tiendaId),
  ]);
  if (cats.error) throw cats.error;
  return { categorias: cats.data, productos };
}

// Supabase entrega como máximo 1000 filas por consulta: se piden por bloques.
const BLOQUE = 1000;

async function todosLosProductos(
  supabase: Awaited<ReturnType<typeof crearClienteServidor>>,
  tiendaId: number,
): Promise<Producto[]> {
  const todos: Producto[] = [];
  for (let desde = 0; ; desde += BLOQUE) {
    const { data, error } = await supabase
      .from("productos")
      .select(COLUMNAS_PRODUCTO)
      .eq("tienda_id", tiendaId)
      .order("creado_en", { ascending: false })
      .order("id", { ascending: false })
      .range(desde, desde + BLOQUE - 1);
    if (error) throw error;
    todos.push(...data);
    if (data.length < BLOQUE) return todos;
  }
}

export async function obtenerProducto(
  tiendaId: number,
  id: number,
): Promise<{ producto: Producto | null; categoria: Categoria | null }> {
  if (!supabaseConfigurado) {
    const producto = productosDemo.find((p) => p.id === id) ?? null;
    const categoria = categoriasDemo.find((c) => c.id === producto?.categoria_id) ?? null;
    return { producto, categoria };
  }
  const supabase = await crearClienteServidor();
  const { data: producto } = await supabase
    .from("productos")
    .select(COLUMNAS_PRODUCTO)
    .eq("tienda_id", tiendaId)
    .eq("id", id)
    .maybeSingle();
  if (!producto?.categoria_id) return { producto, categoria: null };
  const { data: categoria } = await supabase
    .from("categorias")
    .select("id, nombre")
    .eq("id", producto.categoria_id)
    .maybeSingle();
  return { producto, categoria };
}

export async function obtenerCategorias(tiendaId: number): Promise<Categoria[]> {
  if (!supabaseConfigurado) return categoriasDemo;
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.from("categorias").select("id, nombre").eq("tienda_id", tiendaId).order("nombre");
  if (error) throw error;
  return data;
}
