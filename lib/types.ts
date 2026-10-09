export type Categoria = {
  id: number;
  nombre: string;
};

export type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  categoria_id: number | null;
  imagen_url: string | null;
  imagen_path?: string | null;
  creado_en: string;
};

/** Fila de la tabla "tiendas". */
export type FilaTienda = {
  id: number;
  slug: string;
  nombre_tienda: string;
  logo_url: string | null;
  logo_path: string | null;
  codigo_pais: string;
  celular: string;
  activa: boolean;
};

/** Datos de la tienda ya listos para mostrar. */
export type Tienda = {
  id: number;
  slug: string;
  activa: boolean;
  nombre: string;
  logoUrl: string | null;
  celularFormateado: string;
  whatsapp: string;
};
