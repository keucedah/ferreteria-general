# Sitio de las tiendas (Ferretería HN)

Un solo sitio para todas las tiendas de tus clientes. Cada tienda tiene su catálogo, su carrito de cotización por WhatsApp y su panel privado, y solo ve y modifica lo suyo.

- **Por dirección:** `tu-sitio.vercel.app/ferreteria`, `tu-sitio.vercel.app/ana`…
- **Con dominio propio** (clientes que pagan el dominio): `ferreteriaana.com` muestra directamente la tienda "ana".
- **Panel de cada tienda:** `…/ana/entrar` (o el enlace discreto "ENTRAR" arriba a la derecha). El dueño agrega, edita y elimina productos y categorías, y cambia nombre, logo y celular de WhatsApp.
- Las tiendas, sus dueños, el plan (límite de productos), el dominio y si están activas se manejan desde el **panel de clientes**, no desde aquí.
- La raíz del sitio (`/`) no muestra ninguna tienda.

Hecho con Next.js 15 y Supabase. Sin Supabase configurado funciona en **modo demostración** (abre `/demo`).

## Pasar de una tienda a varias (solo una vez)

Tu tienda actual pasa a ser la tienda número 1, con la dirección `/ferreteria`. No se borra ningún producto, categoría, imagen ni usuario.

1. En Supabase > **SQL Editor**, ejecuta `panel.sql` (del panel de clientes) si aún no lo hiciste.
2. Ejecuta todo `supabase/multitienda.sql`. Se puede ejecutar más de una vez sin dañar nada.
3. Sube esta carpeta nueva a GitHub y deja que Vercel despliegue.
4. Abre `tu-sitio.vercel.app/ferreteria` y revisa que estén tus productos.
5. (Opcional) En Vercel > Settings > Environment Variables agrega `URL_INICIO` con la página a la que debe llevar la raíz del sitio, por ejemplo la página de tu negocio o `/ferreteria`.

Entre los pasos 2 y 3 el sitio viejo sigue mostrando la tienda, pero no deja guardar cambios; hazlos seguidos.

## Dominio propio para una tienda

1. Compra el dominio y, en Vercel > tu proyecto > **Settings > Domains**, agrégalo (`ferreteriaana.com` y `www.ferreteriaana.com`). Vercel te dice qué registros DNS poner donde compraste el dominio.
2. En el panel de clientes, en la ficha del cliente, escribe el dominio sin `www` ni `https://` (por ejemplo `ferreteriaana.com`).
3. En unos minutos el dominio muestra la tienda. El enlace por dirección (`/ana`) sigue funcionando.

## Probarlo en tu computador

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev
```

Abre http://localhost:3000/demo (modo demostración) o, con `.env.local` configurado, http://localhost:3000/ferreteria.

## Variables (Vercel > Settings > Environment Variables)

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Project Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Project Settings > API > anon public |
| `URL_INICIO` (opcional) | A dónde lleva la raíz `/` del sitio |

## Seguridad

- Cualquiera **ve** el catálogo de las tiendas activas. Una tienda suspendida muestra "Tienda no disponible" (su dueño sí puede entrar a su panel).
- Cada dueño solo crea, edita o borra productos, categorías e imágenes **de su tienda** (reglas RLS en la base de datos). Aunque cambie la dirección en el navegador, la base de datos no le deja tocar otra tienda.
- El dueño puede cambiar el nombre, el logo y el celular de su tienda, pero **no** su plan, su límite, su dominio ni si está activa.
- El límite de productos del plan lo aplica la base de datos: al llegar al límite no se puede agregar otro producto.
- Las imágenes de cada tienda se guardan en su carpeta (`2/…`); las que ya existían son de la tienda 1.
- Las imágenes se limitan a JPG, PNG, WEBP o GIF de hasta 5 MB.

## Dónde está cada cosa

| Archivo | Qué hace |
|---|---|
| `middleware.ts` | Elige la tienda por dirección o dominio y protege `/admin` |
| `app/[tienda]/page.tsx`, `components/Catalogo.tsx` | Catálogo, búsqueda, filtros por categoría y orden |
| `app/[tienda]/producto/[id]/page.tsx` | Detalle de un producto |
| `app/[tienda]/entrar/`, `app/acciones-entrar.ts` | Inicio de sesión |
| `app/[tienda]/admin/`, `app/acciones-admin.ts` | Panel de la tienda y acciones de guardado |
| `components/CartProvider.tsx`, `components/CartDrawer.tsx` | Carrito (uno por tienda, se guarda en el navegador) y botón de WhatsApp |
| `lib/datos.ts` | Lectura de tiendas, productos y categorías |
| `lib/whatsapp.ts` | Texto del mensaje de cotización |
| `lib/telefono.ts` | Países, validación y formato del celular |
| `supabase/schema.sql` | Tablas originales (proyecto nuevo) |
| `supabase/multitienda.sql` | Tiendas, dueños, límites, permisos por tienda |
