"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { obtenerAdmin } from "@/lib/supabase/server";
import { normalizarCelular } from "@/lib/telefono";

export type Resultado = { ok: boolean; mensaje: string } | null;

const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;

async function exigirAdmin() {
  const { supabase, esAdmin } = await obtenerAdmin();
  if (!esAdmin) throw new Error("No autorizado");
  return supabase;
}

function leerProducto(formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const categoria = Number(formData.get("categoria_id"));
  const imagen = formData.get("imagen");
  const archivo = imagen instanceof File && imagen.size > 0 ? imagen : null;
  return { nombre, descripcion, categoria_id: Number.isInteger(categoria) && categoria > 0 ? categoria : null, archivo };
}

function validarImagen(archivo: File | null): string | null {
  if (!archivo) return null;
  if (!TIPOS.includes(archivo.type)) return "La imagen debe ser JPG, PNG, WEBP o GIF.";
  if (archivo.size > MAX_BYTES) return "La imagen no puede pesar más de 5 MB.";
  return null;
}

async function subirImagen(supabase: Awaited<ReturnType<typeof exigirAdmin>>, archivo: File, carpeta = "") {
  const ext = archivo.type.split("/")[1].replace("jpeg", "jpg");
  const path = `${carpeta}${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("productos").upload(path, archivo, { contentType: archivo.type });
  if (error) throw new Error("No se pudo subir la imagen: " + error.message);
  const { data } = supabase.storage.from("productos").getPublicUrl(path);
  return { imagen_path: path, imagen_url: data.publicUrl };
}

export async function crearProducto(_prev: Resultado, formData: FormData): Promise<Resultado> {
  try {
    const supabase = await exigirAdmin();
    const { nombre, descripcion, categoria_id, archivo } = leerProducto(formData);
    if (!nombre) return { ok: false, mensaje: "El nombre es obligatorio." };
    if (!categoria_id) return { ok: false, mensaje: "Elige una categoría." };
    if (!archivo) return { ok: false, mensaje: "Sube una imagen del producto." };
    const errImg = validarImagen(archivo);
    if (errImg) return { ok: false, mensaje: errImg };

    const imagen = await subirImagen(supabase, archivo);
    const { error } = await supabase.from("productos").insert({ nombre, descripcion, categoria_id, ...imagen });
    if (error) {
      await supabase.storage.from("productos").remove([imagen.imagen_path]);
      return { ok: false, mensaje: "No se pudo guardar: " + error.message };
    }
    revalidatePath("/", "layout");
    return { ok: true, mensaje: `“${nombre}” se agregó al catálogo.` };
  } catch (e) {
    return { ok: false, mensaje: e instanceof Error ? e.message : "Error inesperado." };
  }
}

export async function actualizarProducto(_prev: Resultado, formData: FormData): Promise<Resultado> {
  let exito = false;
  try {
    const supabase = await exigirAdmin();
    const id = Number(formData.get("id"));
    const { nombre, descripcion, categoria_id, archivo } = leerProducto(formData);
    if (!nombre) return { ok: false, mensaje: "El nombre es obligatorio." };
    if (!categoria_id) return { ok: false, mensaje: "Elige una categoría." };
    const errImg = validarImagen(archivo);
    if (errImg) return { ok: false, mensaje: errImg };

    const { data: actual } = await supabase.from("productos").select("imagen_path").eq("id", id).maybeSingle();
    const cambios: Record<string, unknown> = { nombre, descripcion, categoria_id };
    if (archivo) Object.assign(cambios, await subirImagen(supabase, archivo));

    const { error } = await supabase.from("productos").update(cambios).eq("id", id);
    if (error) return { ok: false, mensaje: "No se pudo guardar: " + error.message };
    if (archivo && actual?.imagen_path) await supabase.storage.from("productos").remove([actual.imagen_path]);
    revalidatePath("/", "layout");
    exito = true;
  } catch (e) {
    return { ok: false, mensaje: e instanceof Error ? e.message : "Error inesperado." };
  }
  if (exito) redirect("/admin");
  return null;
}

export async function eliminarProducto(formData: FormData) {
  const supabase = await exigirAdmin();
  const id = Number(formData.get("id"));
  const { data } = await supabase.from("productos").select("imagen_path").eq("id", id).maybeSingle();
  await supabase.from("productos").delete().eq("id", id);
  if (data?.imagen_path) await supabase.storage.from("productos").remove([data.imagen_path]);
  revalidatePath("/", "layout");
}

export async function crearCategoria(_prev: Resultado, formData: FormData): Promise<Resultado> {
  try {
    const supabase = await exigirAdmin();
    const nombre = String(formData.get("nombre") ?? "").trim();
    if (!nombre) return { ok: false, mensaje: "Escribe el nombre de la categoría." };
    const { error } = await supabase.from("categorias").insert({ nombre });
    if (error) return { ok: false, mensaje: error.code === "23505" ? "Esa categoría ya existe." : error.message };
    revalidatePath("/", "layout");
    return { ok: true, mensaje: `Categoría “${nombre}” creada.` };
  } catch (e) {
    return { ok: false, mensaje: e instanceof Error ? e.message : "Error inesperado." };
  }
}

export async function eliminarCategoria(formData: FormData) {
  const supabase = await exigirAdmin();
  await supabase.from("categorias").delete().eq("id", Number(formData.get("id")));
  revalidatePath("/", "layout");
}

export async function guardarConfiguracion(_prev: Resultado, formData: FormData): Promise<Resultado> {
  try {
    const supabase = await exigirAdmin();
    const nombre_tienda = String(formData.get("nombre_tienda") ?? "").trim();
    if (!nombre_tienda) return { ok: false, mensaje: "Escribe el nombre de la ferretería." };
    if (nombre_tienda.length > 60) return { ok: false, mensaje: "El nombre puede tener hasta 60 caracteres." };

    const cel = normalizarCelular(String(formData.get("codigo_pais") ?? ""), String(formData.get("celular") ?? ""));
    if (!cel.ok) return { ok: false, mensaje: cel.error };

    const logo = formData.get("logo");
    const archivo = logo instanceof File && logo.size > 0 ? logo : null;
    const errImg = validarImagen(archivo);
    if (errImg) return { ok: false, mensaje: errImg.replace("La imagen", "El logo") };
    const quitarLogo = formData.get("quitar_logo") === "on";

    const { data: actual } = await supabase.from("configuracion").select("logo_path").eq("id", 1).maybeSingle();
    const cambios: Record<string, unknown> = {
      nombre_tienda,
      codigo_pais: cel.codigo,
      celular: cel.nacional,
      actualizado_en: new Date().toISOString(),
    };
    if (archivo) {
      const subida = await subirImagen(supabase, archivo, "marca/");
      cambios.logo_url = subida.imagen_url;
      cambios.logo_path = subida.imagen_path;
    } else if (quitarLogo) {
      cambios.logo_url = null;
      cambios.logo_path = null;
    }

    const { error } = await supabase.from("configuracion").update(cambios).eq("id", 1);
    if (error) return { ok: false, mensaje: "No se pudo guardar: " + error.message };
    if ((archivo || quitarLogo) && actual?.logo_path) await supabase.storage.from("productos").remove([actual.logo_path]);
    revalidatePath("/", "layout");
    return { ok: true, mensaje: "Datos de la tienda guardados." };
  } catch (e) {
    return { ok: false, mensaje: e instanceof Error ? e.message : "Error inesperado." };
  }
}
