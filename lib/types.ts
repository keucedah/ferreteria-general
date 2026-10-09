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

export type Configuracion = {
  nombre_tienda: string;
  logo_url: string | null;
  logo_path: string | null;
  codigo_pais: string;
  celular: string;
};

/** Datos de la tienda ya listos para mostrar. */
export type Tienda = {
  nombre: string;
  logoUrl: string | null;
  celularFormateado: string;
  whatsapp: string;
};
