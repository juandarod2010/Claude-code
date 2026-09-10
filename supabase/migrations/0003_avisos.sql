-- ---------------------------------------------------------------------------
-- Complyo — aviso de lead nuevo
--
-- QUÉ RESUELVE: hoy, cuando alguien completa el diagnóstico o pide un análisis
-- de apelación, no te avisa nada. Tienes que acordarte de mirar /admin.
--
-- CÓMO: un disparador en `leads` que hace una petición HTTP a la URL que tú
-- pongas. No hace falta backend propio: la petición sale de la propia base de
-- datos con la extensión `pg_net`, que Supabase trae incluida.
--
-- ANTES DE EJECUTAR ESTO:
--   1. Consigue una URL que reciba peticiones POST y te avise. Sirve cualquier
--      servicio de automatización con plan gratuito, o un webhook entrante de
--      la aplicación de mensajería que uses.
--   2. Sustituye PON_AQUI_TU_URL más abajo. Mientras siga ahí ese texto, el
--      disparador NO envía nada: sale sin hacer nada y lo deja anotado.
--   3. Ejecuta este fichero entero en el SQL Editor.
--
-- Comprobación: completa un diagnóstico en tu propia web y mira si te llega.
-- ---------------------------------------------------------------------------

create extension if not exists pg_net with schema extensions;

-- La URL vive en una tabla, no dentro de la función: así puedes cambiarla sin
-- volver a tocar SQL, y no queda escrita en el historial de migraciones.
create table if not exists public.ajustes (
  clave text primary key,
  valor text not null,
  updated_at timestamptz not null default now()
);

alter table public.ajustes enable row level security;

-- Solo el operador autenticado. `anon` no tiene política: RLS deniega.
drop policy if exists "operador gestiona ajustes" on public.ajustes;
create policy "operador gestiona ajustes"
  on public.ajustes for all
  to authenticated
  using (true)
  with check (true);

insert into public.ajustes (clave, valor)
values ('webhook_lead_nuevo', 'PON_AQUI_TU_URL')
on conflict (clave) do nothing;

-- ---------------------------------------------------------------------------
-- El disparador.
-- SECURITY DEFINER porque tiene que leer `ajustes`, que RLS cierra al público:
-- el lead lo inserta un visitante anónimo y necesitamos que el aviso salga
-- igual. `search_path` fijado para que no se pueda secuestrar la resolución de
-- nombres desde otro esquema.
-- ---------------------------------------------------------------------------
create or replace function public.avisar_lead_nuevo()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  destino text;
begin
  select valor into destino from public.ajustes where clave = 'webhook_lead_nuevo';

  if destino is null or destino = 'PON_AQUI_TU_URL' then
    raise notice 'Aviso de lead nuevo sin configurar: repasa supabase/migrations/0003_avisos.sql';
    return new;
  end if;

  -- Se envía lo mínimo para saber que hay que mirar el panel.
  -- Nada de historial comercial ni del texto que escribió el vendedor: ese
  -- contenido no tiene por qué salir a un servicio de terceros.
  perform net.http_post(
    url     := destino,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body    := jsonb_build_object(
      'evento', 'lead_nuevo',
      'tipo',   new.type,
      'correo', new.email,
      'empresa', coalesce(new.company_name, ''),
      'creado', new.created_at
    )
  );

  return new;
exception
  -- Un aviso que falla NUNCA puede tumbar la captación del lead.
  when others then
    raise warning 'No se pudo enviar el aviso de lead nuevo: %', sqlerrm;
    return new;
end;
$$;

drop trigger if exists leads_avisar_nuevo on public.leads;
create trigger leads_avisar_nuevo
  after insert on public.leads
  for each row
  execute function public.avisar_lead_nuevo();
