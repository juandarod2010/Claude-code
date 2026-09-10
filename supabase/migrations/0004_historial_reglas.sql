-- ---------------------------------------------------------------------------
-- Complyo — historial de la base de reglas
--
-- QUÉ RESUELVE: la suscripción de vigilancia que vendes consiste en avisar al
-- cliente cuando cambia algo que le afecta. Sin registro de qué cambió y
-- cuándo, esa suscripción es una promesa vacía. Esta tabla es su sustancia.
--
-- Se escribe sola: el panel anota una entrada cada vez que se guarda o se
-- borra una obligación desde /admin/fill-rules.
--
-- Idempotente: se puede volver a ejecutar sin romper nada.
-- ---------------------------------------------------------------------------

create table if not exists public.reglas_historial (
  id          uuid primary key,
  rule_id     text not null,
  changed_at  timestamptz not null default now(),
  change_type text not null check (change_type in ('alta', 'modificacion', 'baja')),
  -- Estado completo de la obligación tras el cambio. En una baja, el último
  -- estado conocido: si mañana un cliente pregunta qué decía, hay respuesta.
  payload     jsonb not null,
  -- Campos que cambiaron, con su valor antes y después.
  changes     jsonb not null default '[]'::jsonb
);

create index if not exists reglas_historial_rule_id_idx on public.reglas_historial (rule_id);
create index if not exists reglas_historial_changed_at_idx on public.reglas_historial (changed_at desc);

-- Ojo: NO hay clave ajena contra `reglas`. El historial tiene que sobrevivir al
-- borrado de la obligación; si no, perderías justo el registro de la baja.

alter table public.reglas_historial enable row level security;

-- Solo el operador autenticado. `anon` no tiene política: RLS deniega.
drop policy if exists "operador lee historial" on public.reglas_historial;
create policy "operador lee historial"
  on public.reglas_historial for select
  to authenticated
  using (true);

drop policy if exists "operador anota historial" on public.reglas_historial;
create policy "operador anota historial"
  on public.reglas_historial for insert
  to authenticated
  with check (true);

-- Sin UPDATE ni DELETE para nadie: un historial que se puede reescribir no
-- sirve como historial. Si hay que corregir algo, se anota otra entrada.
