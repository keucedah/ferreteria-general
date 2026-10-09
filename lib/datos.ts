import { cache } from "react";
import { supabaseConfigurado } from "./config";
import { categoriasDemo, productosDemo } from "./demo";
import { crearClienteServidor } from "./supabase/server";
import { formatearCelular, numeroWhatsApp } from "./telefono";
import type { Categoria, Configuracion, Producto, Tienda } from "./types";

export async function obtenerCatalogo(): Promise<{ categorias: Categoria[]; productos: Producto[] }> {
  if (!supabaseConfigurado) return { categorias: categoriasDemo, productos: productosDemo };

  const supabase = await crearClienteServidor();
  const [cats, prods] = await Promise.all([
    supabase.from("categorias").select("id, nombre").order("nombre"),
    supabase
      .from("productos")
      .select("id, nombre, descripcion, categoria_id, imagen_url, imagen_path, creado_en")
      .order("creado_en", { ascending: false }),
  ]);
  if (cats.error) throw cats.error;
  if (prods.error) throw prods.error;
  return { categorias: cats.data, productos: prods.data };
}

export async function obtenerProducto(id: number): Promise<{ producto: Producto | null; categoria: Categoria | null }> {
  if (!supabaseConfigurado) {
    const producto = productosDemo.find((p) => p.id === id) ?? null;
    const categoria = categoriasDemo.find((c) => c.id === producto?.categoria_id) ?? null;
    return { producto, categoria };
  }
  const supabase = await crearClienteServidor();
  const { data: producto } = await supabase
    .from("productos")
    .select("id, nombre, descripcion, categoria_id, imagen_url, imagen_path, creado_en")
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

const configuracionDemo: Configuracion = {
  nombre_tienda: "Ferretería",
  logo_url: null,
  logo_path: null,
  codigo_pais: "52",
  celular: "5512345678",
};

export const obtenerConfiguracion = cache(async (): Promise<Configuracion> => {
  if (!supabaseConfigurado) return configuracionDemo;
  const supabase = await crearClienteServidor();
  const { data } = await supabase
    .from("configuracion")
    .select("nombre_tienda, logo_url, logo_path, codigo_pais, celular")
    .eq("id", 1)
    .maybeSingle();
  return data ?? configuracionDemo;
});

export async function obtenerTienda(): Promise<Tienda> {
  const c = await obtenerConfiguracion();
  return {
    nombre: c.nombre_tienda,
    logoUrl: c.logo_url,
    celularFormateado: formatearCelular(c.codigo_pais, c.celular),
    whatsapp: numeroWhatsApp(c.codigo_pais, c.celular),
  };
}
