# Sitio de la ferretería

Catálogo web con carrito de cotización por WhatsApp y un panel privado para que el administrador suba productos.

**Público (sin cuenta):** ver productos, explorar por categoría, buscar por nombre, ordenar, agregar al carrito y enviar la cotización por WhatsApp.
**Administrador:** entra con el enlace discreto "ENTRAR" (arriba a la derecha) y desde `/admin` agrega, edita y elimina productos (imagen, nombre, descripción, categoría) y categorías, y cambia los datos de la tienda: nombre, logo y celular de WhatsApp (el celular se valida y se muestra con formato automáticamente).

Hecho con Next.js 15 y Supabase (inicio de sesión, base de datos e imágenes). Sin Supabase configurado, el sitio funciona en **modo demostración** con productos de ejemplo.

## Probarlo en tu computador

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

## Conectar la base de datos (Supabase, plan gratuito)

1. Crea un proyecto en https://supabase.com.
2. En **SQL Editor**, pega y ejecuta todo el archivo `supabase/schema.sql`. Crea las tablas, la seguridad y el espacio para imágenes.
3. En **Authentication > Sign In / Providers**, desactiva **Allow new users to sign up** (así nadie más puede crearse una cuenta).
4. En **Authentication > Users > Add user**, crea el usuario administrador con correo y contraseña.
5. De vuelta en **SQL Editor**, conviértelo en administrador:
   ```sql
   insert into public.administradores (user_id)
   select id from auth.users where email = 'tu-correo@ejemplo.com';
   ```
6. Copia `.env.example` como `.env.local` y completa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (en **Project Settings > API**).
7. Entra al sitio con "ENTRAR" y, en **Datos de la tienda**, pon el nombre, el logo y el celular de WhatsApp.

## Publicarlo (Vercel, plan gratuito)

1. Sube esta carpeta a un repositorio de GitHub.
2. En https://vercel.com, importa el repositorio.
3. Agrega las dos variables de `.env.local` en **Settings > Environment Variables** y despliega.

## Seguridad

- Las reglas de la base de datos (RLS) permiten que cualquiera **lea** el catálogo, pero solo los usuarios de la tabla `administradores` pueden crear, editar o borrar productos, categorías e imágenes. Aunque alguien descubra `/entrar`, sin una cuenta de administrador no puede modificar nada.
- `/admin` redirige a `/entrar` si no hay sesión.
- Los datos de la tienda (tabla `configuracion`) también solo los cambia un administrador.
- Las imágenes se limitan a JPG, PNG, WEBP o GIF de hasta 5 MB.

## Dónde está cada cosa

| Archivo | Qué hace |
|---|---|
| `app/page.tsx`, `components/Catalogo.tsx` | Catálogo, búsqueda, filtros por categoría y orden |
| `components/CartProvider.tsx`, `components/CartDrawer.tsx` | Carrito (se guarda en el navegador) y botón de WhatsApp |
| `lib/whatsapp.ts` | Texto del mensaje de cotización |
| `lib/telefono.ts` | Países, validación y formato del celular |
| `components/admin/FormularioTienda.tsx` | Formulario de nombre, logo y celular |
| `app/producto/[id]/page.tsx` | Detalle de un producto |
| `app/entrar/` | Inicio de sesión |
| `app/admin/` | Panel de administración y acciones de guardado |
| `supabase/schema.sql` | Tablas, permisos y almacenamiento |
