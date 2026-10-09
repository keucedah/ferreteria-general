"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCarrito } from "./CartProvider";
import { useBase } from "./BaseTienda";
import type { Tienda } from "@/lib/types";

export default function Header({ tienda }: { tienda: Tienda }) {
  const { totalUnidades, abrir } = useCarrito();
  const base = useBase();
  return (
    <header className="sticky top-0 z-30 border-b border-acero-800 bg-acero-900 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href={base || "/"} className="flex min-w-0 items-center gap-2 text-lg font-bold tracking-tight">
          {tienda.logoUrl ? (
            <img src={tienda.logoUrl} alt="" className="h-9 max-w-[120px] rounded object-contain" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-marca-500 text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </span>
          )}
          <span className="line-clamp-1">{tienda.nombre}</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={abrir}
            className="relative flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/20"
            aria-label="Abrir carrito de cotización"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="hidden sm:inline">Cotización</span>
            {totalUnidades > 0 && (
              <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-marca-500 px-1.5 text-center text-xs font-bold leading-5">
                {totalUnidades}
              </span>
            )}
          </button>
          {/* Acceso discreto para el administrador */}
          <Link href={`${base}/entrar`} className="text-xs font-medium uppercase tracking-wider text-gray-400 hover:text-white">
            Entrar
          </Link>
        </div>
      </div>
    </header>
  );
}
