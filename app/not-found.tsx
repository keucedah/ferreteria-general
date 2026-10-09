import Link from "next/link";

export default function NoEncontrado() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">No encontramos esta página</h1>
      <Link href="/" className="boton-primario mt-6">Volver al catálogo</Link>
    </div>
  );
}
