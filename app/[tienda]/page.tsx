import { Suspense } from "react";
import { notFound } from "next/navigation";
import Catalogo from "@/components/Catalogo";
import NoDisponible from "@/components/NoDisponible";
import { obtenerCatalogo, obtenerTienda } from "@/lib/datos";
import { supabaseConfigurado } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function Inicio({ params }: { params: Promise<{ tienda: string }> }) {
  const tienda = await obtenerTienda((await params).tienda);
  if (!tienda) notFound();
  if (!tienda.activa) return <NoDisponible nombre={tienda.nombre} />;
  const { categorias, productos } = await obtenerCatalogo(tienda.id);
  return (
    <>
      <section className="bg-gradient-to-r from-acero-900 to-acero-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h1 className="text-2xl font-bold sm:text-3xl">Todo para tu obra y tu hogar</h1>
          <p className="mt-2 max-w-xl text-gray-300">
            Explora el catálogo, agrega lo que necesitas al carrito y envíanos tu cotización por WhatsApp.
          </p>
        </div>
      </section>
      {!supabaseConfigurado && (
        <p className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
          Modo demostración: se muestran productos de ejemplo hasta conectar la base de datos.
        </p>
      )}
      <Suspense>
        <Catalogo categorias={categorias} productos={productos} />
      </Suspense>
    </>
  );
}
