"use client";

import { useActionState, useEffect, useRef } from "react";
import { crearCategoria } from "@/app/admin/acciones";

export default function FormularioCategoria() {
  const [resultado, enviar, enviando] = useActionState(crearCategoria, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resultado?.ok) formRef.current?.reset();
  }, [resultado]);

  return (
    <form ref={formRef} action={enviar} className="space-y-2">
      <div className="flex gap-2">
        <input name="nombre" required maxLength={80} placeholder="Nueva categoría" className="campo" />
        <button type="submit" disabled={enviando} className="boton-secundario shrink-0">
          Crear
        </button>
      </div>
      {resultado && (
        <p className={`text-sm ${resultado.ok ? "text-green-700" : "text-red-700"}`}>{resultado.mensaje}</p>
      )}
    </form>
  );
}
