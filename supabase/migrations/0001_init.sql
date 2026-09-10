-- ---------------------------------------------------------------------------
-- Complyo — esquema inicial
-- Ejecutar en el SQL Editor de Supabase, o con `supabase db push`.
--
-- MODELO DE ACCESO (importante, leer antes de tocar nada):
--   * El navegador público usa la clave "anon". Solo puede INSERTAR:
--     un lead y su informe. NO puede leer nada de nadie.
--   * El panel interno (/admin) necesita LEER. Con Row Level Security activado,
--     leer exige un usuario autenticado de Supabase (rol `authenticated`).
--     Ver NEXT-STEPS.md: hasta que crees ese usuario, /admin funciona en modo
--     MOCK (localStorage). NUNCA pongas la clave `service_role` en el navegador.
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto";

-- ------------------------------- LEADS -------------------------------------
create table if not exists public.leads (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  email        text not null check (position('@' in email) > 1),
  company_name text,
  -- Respuestas completas del diagnóstico, tal cual las envió el formulario.
  answers      jsonb not null
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (email);
-- Permite filtrar por país de destino en /admin sin desnormalizar.
create index if not exists leads_answers_gin_idx on public.leads using gin (answers);

-- ------------------------------ INFORMES -----------------------------------
create table if not exists public.informes (
  id                  uuid primary key default gen_random_uuid(),
  lead_id             uuid not null references public.leads (id) on delete cascade,
  created_at          timestamptz not null default now(),
  -- Resultado del motor CONGELADO. Un informe entregado no puede cambiar
  -- porque mañana se actualice la base de reglas.
  result              jsonb not null,
  rules_snapshot_size integer not null default 0
);

create index if not exists informes_lead_id_idx on public.informes (lead_id);
create index if not exists informes_created_at_idx on public.informes (created_at desc);

-- ----------------------------- PROSPECTOS ----------------------------------
-- Registro de a quién se escribió y con qué variante (A/B), para medir cuál
-- responde mejor. Se rellena a mano desde /prospeccion. Nunca por scraping.
create table if not exists public.prospectos (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  listing_ref   text not null,
  country       text not null,
  missing_items text[] not null default '{}',
  variant       text not null check (variant in ('A', 'B')),
  notes         text
);

create index if not exists prospectos_created_at_idx on public.prospectos (created_at desc);
create index if not exists prospectos_variant_idx on public.prospectos (variant);

-- --------------------------- ROW LEVEL SECURITY -----------------------------
alter table public.leads      enable row level security;
alter table public.informes   enable row level security;
alter table public.prospectos enable row level security;

-- Un usuario anónimo puede crear su lead desde el formulario público.
drop policy if exists "anon crea leads" on public.leads;
create policy "anon crea leads"
  on public.leads for insert
  to anon
  with check (true);

-- Y el informe asociado a un lead que exista.
drop policy if exists "anon crea informes" on public.informes;
create policy "anon crea informes"
  on public.informes for insert
  to anon
  with check (exists (select 1 from public.leads l where l.id = lead_id));

-- Lectura: solo usuarios autenticados (el operador del panel interno).
-- No hay política de SELECT para `anon`: sin política, RLS deniega.
drop policy if exists "operador lee leads" on public.leads;
create policy "operador lee leads"
  on public.leads for select
  to authenticated
  using (true);

drop policy if exists "operador lee informes" on public.informes;
create policy "operador lee informes"
  on public.informes for select
  to authenticated
  using (true);

drop policy if exists "operador gestiona prospectos" on public.prospectos;
create policy "operador gestiona prospectos"
  on public.prospectos for all
  to authenticated
  using (true)
  with check (true);

-- No se conceden UPDATE ni DELETE a nadie salvo `service_role`, que salta RLS
-- por diseño y solo debe usarse desde fuera del navegador.
