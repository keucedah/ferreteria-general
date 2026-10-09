import Link from "next/link";

export default function NoEncontrado() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">No encontramos esta página</h1>
      <p className="mt-2 text-gray-600">Revisa que el enlace esté bien escrito.</p>
      <Link href="/" className="boton-secundario mt-6">Ir al inicio</Link>
    </div>
  );
}
