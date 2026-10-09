import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseConfigurado } from "@/lib/config";

// La raíz del sitio no muestra ninguna tienda: cada tienda tiene su dirección (/ferreteria, /ana...)
// o su propio dominio. Con URL_INICIO en las variables de Vercel, la raíz lleva a esa página.
export const dynamic = "force-dynamic";

export default function Inicio() {
  const destino = process.env.URL_INICIO;
  if (destino) redirect(destino);
  return (
    <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Tiendas en línea</h1>
      <p className="mt-2 text-gray-600">Para ver una tienda, abre el enlace que te compartió el negocio.</p>
      {!supabaseConfigurado && (
        <Link href="/demo" className="boton-primario mt-6">Ver tienda de demostración</Link>
      )}
    </div>
  );
}
