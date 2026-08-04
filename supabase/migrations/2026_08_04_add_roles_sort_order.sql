-- Ejecutar en el SQL Editor de Supabase para bases ya existentes.
-- Agrega la columna sort_order a roles y hace un backfill por sección
-- usando el orden alfabético de label (podés reacomodar después desde la UI).

alter table roles
  add column if not exists sort_order integer not null default 0;

with ranked as (
  select
    id,
    row_number() over (partition by section_id order by label) as rn
  from roles
)
update roles
set sort_order = ranked.rn
from ranked
where roles.id = ranked.id
  and roles.sort_order = 0;
