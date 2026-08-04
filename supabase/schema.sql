-- Ejecutar en el SQL Editor de Supabase
-- Crea las 4 tablas + políticas RLS abiertas (sin auth) + realtime.

create table if not exists role_sections (
  id text primary key,
  label text not null,
  created_at timestamptz default now()
);

create table if not exists roles (
  id text primary key,
  label text not null,
  section_id text not null references role_sections(id) on delete cascade,
  allow_multiple boolean default false,
  highlight boolean default false,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

create table if not exists people (
  id text primary key,
  name text not null,
  exceptions jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists service_events (
  id text primary key,
  date text not null,
  assignments jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

-- RLS abierta: sin auth, cualquiera con la anon key lee y escribe.
alter table role_sections enable row level security;
alter table roles enable row level security;
alter table people enable row level security;
alter table service_events enable row level security;

create policy "public all" on role_sections for all using (true) with check (true);
create policy "public all" on roles for all using (true) with check (true);
create policy "public all" on people for all using (true) with check (true);
create policy "public all" on service_events for all using (true) with check (true);

-- Realtime
alter publication supabase_realtime add table role_sections;
alter publication supabase_realtime add table roles;
alter publication supabase_realtime add table people;
alter publication supabase_realtime add table service_events;
