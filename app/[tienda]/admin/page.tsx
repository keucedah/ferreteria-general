import Link from "next/link";
import { notFound } from "next/navigation";
import ImagenProducto from "@/components/ImagenProducto";
import FormularioProducto from "@/components/admin/FormularioProducto";
import FormularioCategoria from "@/components/admin/FormularioCategoria";
import FormularioTienda from "@/components/admin/FormularioTienda";
import BotonEliminar from "@/components/admin/BotonEliminar";
import { crearCategoria, crearProducto, eliminarCategoria, eliminarProducto, guardarConfiguracion } from "@/app/acciones-admin";
import { cerrarSesion } from "@/app/acciones-entrar";
import { obtenerAdmin } from "@/lib/supabase/server";
import { obtenerBase, obtenerCatalogo, obtenerFilaTienda } from "@/lib/datos";
import { supabaseConfigurado } from "@/lib/config";

export const dynamic = "force-dynamic";

function Aviso({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-xl font-bold">{titulo}</h1>
      <div className="mt-2 text-gray-600">{children}</div>
    </div>
  );
}

export default async function Admin({ params }: { params: Promise<{ tienda: string }> }) {
  if (!supabaseConfigurado) {
    return (
      <Aviso titulo="Panel no disponible en modo demostración">
        Conecta Supabase siguiendo el archivo README para poder iniciar sesión y subir productos.
      </Aviso>
    );
  }

  const tienda = await obtenerFilaTienda((await params).tienda);
  if (!tienda) notFound();
  const { user, esAdmin } = await obtenerAdmin(tienda.id);
  if (!user || !esAdmin) {
    return (
      <Aviso titulo="Sin permisos de administrador">
        <p>Tu cuenta no tiene permiso para administrar esta tienda.</p>
        <form action={cerrarSesion} className="mt-4">
          <button className="boton-secundario">Cerrar sesión</button>
        </form>
      </Aviso>
    );
  }

  const [{ categorias, productos }, base] = await Promise.all([obtenerCatalogo(tienda.id), obtenerBase()]);
  const nombreCat = new Map(categorias.map((c) => [c.id, c.nombre]));
  const conteo = new Map<number, number>();
  for (const p of productos) if (p.categoria_id) conteo.set(p.categoria_id, (conteo.get(p.categoria_id) ?? 0) + 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Panel de administración</h1>
          <p className="text-sm text-gray-500">Sesión iniciada como {user.email}</p>
        </div>
        <div className="flex gap-2">
          <Link href={base || "/"} className="boton-secundario">Ver catálogo</Link>
          <form action={cerrarSesion}>
            <button className="boton-secundario">Cerrar sesión</button>
          </form>
        </div>
      </div>

      {!tienda.activa && (
        <p className="mb-6 rounded-xl bg-amber-100 px-4 py-3 text-sm text-amber-900">
          Tu tienda está suspendida: los visitantes no ven el catálogo. Comunícate con tu proveedor para reactivarla.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold">Agregar producto</h2>
            {categorias.length === 0 ? (
              <p className="text-sm text-gray-600">Primero crea al menos una categoría.</p>
            ) : (
              <FormularioProducto categorias={categorias} accion={crearProducto.bind(null, tienda.id)} />
            )}
          </section>

          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold">Datos de la tienda</h2>
            <FormularioTienda config={tienda} accion={guardarConfiguracion.bind(null, tienda.id)} />
          </section>

          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-bold">Categorías</h2>
            <FormularioCategoria accion={crearCategoria.bind(null, tienda.id)} />
            <ul className="mt-4 divide-y text-sm">
              {categorias.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2">
                  <span>
                    {c.nombre} <span className="text-gray-400">({conteo.get(c.id) ?? 0})</span>
                  </span>
                  <BotonEliminar
                    id={c.id}
                    accion={eliminarCategoria.bind(null, tienda.id)}
                    confirmacion={`¿Eliminar la categoría “${c.nombre}”? Sus productos quedarán sin categoría.`}
                  />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Productos ({productos.length})</h2>
          {productos.length === 0 ? (
            <p className="text-sm text-gray-600">Aún no hay productos. Agrega el primero con el formulario.</p>
          ) : (
            <ul className="divide-y">
              {productos.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <ImagenProducto src={p.imagen_url} alt={p.nombre} className="h-16 w-16 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {p.categoria_id ? nombreCat.get(p.categoria_id) : "Sin categoría"}
                    </p>
                  </div>
                  <Link href={`${base}/admin/producto/${p.id}`} className="text-sm font-medium text-marca-600 hover:underline">
                    Editar
                  </Link>
                  <BotonEliminar
                    id={p.id}
                    accion={eliminarProducto.bind(null, tienda.id)}
                    confirmacion={`¿Eliminar “${p.nombre}”?`}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
