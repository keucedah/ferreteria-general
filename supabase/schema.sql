-- Esquema de la base de datos de la ferretería.
-- Ejecutar completo en Supabase > SQL Editor (una sola vez).

-- Categorías ---------------------------------------------------------------
create table if not exists public.categorias (
  id bigint generated always as identity primary key,
  nombre text not null unique check (char_length(nombre) between 1 and 80),
  creado_en timestamptz not null default now()
);

-- Productos ----------------------------------------------------------------
create table if not exists public.productos (
  id bigint generated always as identity primary key,
  nombre text not null check (char_length(nombre) between 1 and 150),
  descripcion text not null default '' check (char_length(descripcion) <= 3000),
  categoria_id bigint references public.categorias (id) on delete set null,
  imagen_url text,
  imagen_path text,
  creado_en timestamptz not null default now()
);

create index if not exists productos_categoria_id_idx on public.productos (categoria_id);
create index if not exists productos_creado_en_idx on public.productos (creado_en desc);

-- Administradores ----------------------------------------------------------
-- Solo los usuarios listados aquí pueden crear, editar o borrar productos.
create table if not exists public.administradores (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.administradores where user_id = (select auth.uid())
  );
$$;

revoke execute on function public.es_admin() from public;
grant execute on function public.es_admin() to anon, authenticated;

-- Seguridad por filas (RLS) -------------------------------------------------
alter table public.categorias enable row level security;
alter table public.productos enable row level security;
alter table public.administradores enable row level security;

-- Cualquiera (incluso sin sesión) puede ver el catálogo
drop policy if exists "catalogo publico categorias" on public.categorias;
create policy "catalogo publico categorias" on public.categorias
  for select to anon, authenticated using (true);

drop policy if exists "catalogo publico productos" on public.productos;
create policy "catalogo publico productos" on public.productos
  for select to anon, authenticated using (true);

-- Solo administradores modifican
drop policy if exists "admin gestiona categorias" on public.categorias;
create policy "admin gestiona categorias" on public.categorias
  for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

drop policy if exists "admin gestiona productos" on public.productos;
create policy "admin gestiona productos" on public.productos
  for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

-- Un usuario solo puede ver su propia fila de administrador
drop policy if exists "ver propio registro admin" on public.administradores;
create policy "ver propio registro admin" on public.administradores
  for select to authenticated using (user_id = (select auth.uid()));

-- Datos de la tienda (una sola fila, editable desde el panel) ---------------
create table if not exists public.configuracion (
  id smallint primary key default 1 check (id = 1),
  nombre_tienda text not null default 'Ferretería' check (char_length(nombre_tienda) between 1 and 60),
  logo_url text,
  logo_path text,
  codigo_pais text not null default '52' check (codigo_pais ~ '^[0-9]{1,4}$'),
  celular text not null default '' check (celular ~ '^[0-9]{0,14}$'),
  actualizado_en timestamptz not null default now()
);

insert into public.configuracion (id) values (1) on conflict (id) do nothing;

alter table public.configuracion enable row level security;

drop policy if exists "configuracion publica" on public.configuracion;
create policy "configuracion publica" on public.configuracion
  for select to anon, authenticated using (true);

drop policy if exists "admin edita configuracion" on public.configuracion;
create policy "admin edita configuracion" on public.configuracion
  for update to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

-- Almacenamiento de imágenes -----------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('productos', 'productos', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admin sube imagenes" on storage.objects;
create policy "admin sube imagenes" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'productos' and (select public.es_admin()));

drop policy if exists "admin actualiza imagenes" on storage.objects;
create policy "admin actualiza imagenes" on storage.objects
  for update to authenticated
  using (bucket_id = 'productos' and (select public.es_admin()));

drop policy if exists "admin borra imagenes" on storage.objects;
create policy "admin borra imagenes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'productos' and (select public.es_admin()));

-- Categorías iniciales (puedes cambiarlas desde el panel)
insert into public.categorias (nombre) values
  ('Herramientas manuales'),
  ('Herramientas eléctricas'),
  ('Tornillería y fijaciones'),
  ('Pinturas'),
  ('Electricidad'),
  ('Plomería')
on conflict (nombre) do nothing;

-- PASO FINAL (manual): después de crear tu usuario en
-- Supabase > Authentication > Users, conviértelo en administrador:
--   insert into public.administradores (user_id)
--   select id from auth.users where email = 'tu-correo@ejemplo.com';
