import Link from "next/link";
import { notFound } from "next/navigation";
import ImagenProducto from "@/components/ImagenProducto";
import BotonAgregar from "@/components/BotonAgregar";
import { obtenerProducto, obtenerTienda } from "@/lib/datos";
import { enlaceWhatsApp, mensajeCotizacion } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function PaginaProducto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num)) notFound();
  const [{ producto, categoria }, tienda] = await Promise.all([obtenerProducto(num), obtenerTienda()]);
  if (!producto) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-marca-600">Catálogo</Link>
        {categoria && (
          <>
            {" / "}
            <Link href={`/?categoria=${categoria.id}`} className="hover:text-marca-600">{categoria.nombre}</Link>
          </>
        )}
      </nav>
      <div className="grid gap-6 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-2 md:p-6">
        <ImagenProducto src={producto.imagen_url} alt={producto.nombre} className="aspect-square w-full rounded-xl" />
        <div className="flex flex-col gap-4">
          {categoria && (
            <span className="text-sm font-medium uppercase tracking-wide text-marca-600">{categoria.nombre}</span>
          )}
          <h1 className="text-2xl font-bold">{producto.nombre}</h1>
          <p className="whitespace-pre-line text-gray-700">{producto.descripcion}</p>
          <div className="mt-auto space-y-2">
            <BotonAgregar producto={producto} grande />
            {tienda.whatsapp && (
            <a
              href={enlaceWhatsApp(tienda.whatsapp, mensajeCotizacion([{ nombre: producto.nombre, cantidad: 1 }]))}
              target="_blank"
              rel="noopener noreferrer"
              className="boton-whatsapp w-full py-3 text-base"
            >
              Cotizar solo este producto por WhatsApp
            </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
