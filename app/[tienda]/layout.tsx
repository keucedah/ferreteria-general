import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CartProvider } from "@/components/CartProvider";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import { BaseTienda } from "@/components/BaseTienda";
import { obtenerBase, obtenerTienda } from "@/lib/datos";

type Props = { params: Promise<{ tienda: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tienda = await obtenerTienda((await params).tienda);
  if (!tienda) return {};
  return {
    title: `${tienda.nombre} | Catálogo`,
    description: `Catálogo de productos de ${tienda.nombre}. Arma tu pedido y cotiza por WhatsApp.`,
    icons: tienda.logoUrl ? { icon: tienda.logoUrl } : undefined,
  };
}

export default async function LayoutTienda({ params, children }: Props & { children: React.ReactNode }) {
  const tienda = await obtenerTienda((await params).tienda);
  if (!tienda) notFound();
  const base = await obtenerBase();

  return (
    <BaseTienda base={base}>
      <CartProvider clave={tienda.slug}>
        <Header tienda={tienda} />
        <main className="flex-1">{children}</main>
        <footer className="border-t bg-white py-6 text-center text-xs text-gray-500">
          {tienda.celularFormateado && (
            <p className="mb-1 text-sm text-gray-700">
              WhatsApp y llamadas:{" "}
              <a href={`https://wa.me/${tienda.whatsapp}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-marca-700 hover:underline">
                {tienda.celularFormateado}
              </a>
            </p>
          )}
          © {new Date().getFullYear()} {tienda.nombre}. Precios y disponibilidad por cotización.
        </footer>
        <CartDrawer whatsapp={tienda.whatsapp} />
      </CartProvider>
    </BaseTienda>
  );
}
