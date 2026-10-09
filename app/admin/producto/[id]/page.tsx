import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import FormularioProducto from "@/components/admin/FormularioProducto";
import { actualizarProducto } from "../../acciones";
import { obtenerAdmin } from "@/lib/supabase/server";
import { obtenerCatalogo, obtenerProducto } from "@/lib/datos";
import { supabaseConfigurado } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function EditarProducto({ params }: { params: Promise<{ id: string }> }) {
  if (!supabaseConfigurado) redirect("/admin");
  const { esAdmin } = await obtenerAdmin();
  if (!esAdmin) redirect("/admin");

  const { id } = await params;
  const [{ producto }, { categorias }] = await Promise.all([obtenerProducto(Number(id)), obtenerCatalogo()]);
  if (!producto) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Link href="/admin" className="text-sm text-gray-500 hover:text-marca-600">← Volver al panel</Link>
      <section className="mt-3 rounded-2xl border bg-white p-5 shadow-sm">
        <h1 className="mb-4 text-xl font-bold">Editar producto</h1>
        <FormularioProducto categorias={categorias} accion={actualizarProducto} producto={producto} />
      </section>
    </div>
  );
}
