-- ---------------------------------------------------------------------------
-- Complyo — fase 2
--
-- Añade:
--   * Track A (apelaciones): tipo de lead, datos de la apelación.
--   * Seguimiento comercial: estado, ingresos, variante y notas por lead.
--   * Tabla `reglas`: la base de obligaciones editable desde /admin/fill-rules,
--     para no tener que tocar TypeScript.
--   * Número legible de informe y marca de respuesta en prospectos.
--
-- Es idempotente: se puede volver a ejecutar sin romper nada.
-- ---------------------------------------------------------------------------

-- ------------------------------- LEADS -------------------------------------
alter table public.leads add column if not exists updated_at timestamptz not null default now();
alter table public.leads add column if not exists type text not null default 'complyo';
alter table public.leads add column if not exists status text not null default 'nuevo';
alter table public.leads add column if not exists appeal jsonb;
alter table public.leads add column if not exists variant text;
alter table public.leads add column if not exists revenue numeric;
alter table public.leads add column if not exists notes jsonb not null default '[]'::jsonb;

-- `answers` deja de ser obligatorio: un lead de apelación no responde el
-- diagnóstico de cumplimiento.
alter table public.leads alter column answers drop not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'leads_type_check') then
    alter table public.leads add constraint leads_type_check
      check (type in ('complyo', 'appeal'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'leads_status_check') then
    alter table public.leads add constraint leads_status_check
      check (status in ('nuevo', 'contactado', 'convertido', 'descartado'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'leads_variant_check') then
    alter table public.leads add constraint leads_variant_check
      check (variant is null or variant in ('A', 'B'));
  end if;
end $$;

create index if not exists leads_type_idx on public.leads (type);
create index if not exists leads_status_idx on public.leads (status);

-- ------------------------------ INFORMES -----------------------------------
-- Número legible del informe: INFORME-YYYYMMDD-XXXX.
alter table public.informes add column if not exists reference text;
create index if not exists informes_reference_idx on public.informes (reference);

-- ----------------------------- PROSPECTOS ----------------------------------
-- Marca de respuesta: es lo que permite comparar la variante A con la B.
alter table public.prospectos add column if not exists responded boolean not null default false;

-- ------------------------------- REGLAS ------------------------------------
-- Base de obligaciones editable desde el panel interno.
-- El contenido va en `payload` con la misma forma que `ObligationRule` en
-- TypeScript: así se puede ampliar el esquema sin migrar la tabla cada vez.
create table if not exists public.reglas (
  id         text primary key,
  payload    jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reglas_updated_at_idx on public.reglas (updated_at desc);
-- Permite filtrar por país y flujo sin desnormalizar.
create index if not exists reglas_payload_gin_idx on public.reglas using gin (payload);

-- --------------------------- ROW LEVEL SECURITY -----------------------------
alter table public.reglas enable row level security;

-- Las reglas las gestiona solo el operador autenticado.
-- No hay política para `anon`: sin política, RLS deniega.
drop policy if exists "operador gestiona reglas" on public.reglas;
create policy "operador gestiona reglas"
  on public.reglas for all
  to authenticated
  using (true)
  with check (true);

-- El formulario público de apelaciones inserta con la clave anónima, igual que
-- el diagnóstico. La política de INSERT de `leads` de la migración 0001 ya lo
-- cubre; se recrea aquí para dejarlo explícito tras añadir las columnas.
drop policy if exists "anon crea leads" on public.leads;
create policy "anon crea leads"
  on public.leads for insert
  to anon
  with check (
    type in ('complyo', 'appeal')
    and status = 'nuevo'
    -- Un visitante anónimo no puede escribir su propio historial comercial.
    and revenue is null
    and notes = '[]'::jsonb
  );

-- El operador autenticado sí puede actualizar el estado, las notas y el ingreso.
drop policy if exists "operador actualiza leads" on public.leads;
create policy "operador actualiza leads"
  on public.leads for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "operador actualiza informes" on public.informes;
create policy "operador actualiza informes"
  on public.informes for update
  to authenticated
  using (true)
  with check (true);
