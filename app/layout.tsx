import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tienda en línea",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
