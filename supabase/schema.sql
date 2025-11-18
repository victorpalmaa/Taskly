-- Supabase schema: tabela de tarefas e políticas RLS

-- Criação da tabela principal
create table if not exists public.tasks (
  id text primary key,
  title text not null,
  description text null,
  category text not null check (category in ('trabalho','pessoal')),
  priority text not null default '' check (priority in ('','baixa','media','alta')),
  completed boolean not null default false,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

-- Índice para ordenação por data de criação
create index if not exists tasks_created_date_idx on public.tasks (created_date desc);

-- Ativa RLS e cria políticas abertas (ambiente de desenvolvimento)
alter table public.tasks enable row level security;

-- Remove políticas existentes para recriação segura
drop policy if exists "read_all" on public.tasks;
drop policy if exists "insert_all" on public.tasks;
drop policy if exists "update_all" on public.tasks;
drop policy if exists "delete_all" on public.tasks;

-- Leitura aberta
create policy "read_all" on public.tasks
  for select
  using (true);

-- Inserção aberta
create policy "insert_all" on public.tasks
  for insert
  with check (true);

-- Atualização aberta
create policy "update_all" on public.tasks
  for update
  using (true)
  with check (true);

-- Exclusão aberta
create policy "delete_all" on public.tasks
  for delete
  using (true);

-- Trigger opcional para manter updated_date sempre atualizada
create or replace function public.set_updated_date()
returns trigger as $$
begin
  new.updated_date := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tasks_set_updated_date on public.tasks;
create trigger tasks_set_updated_date
before update on public.tasks
for each row
execute function public.set_updated_date();

-- =========================
-- Tabela de anotações de reuniões
-- =========================

create table if not exists public.notes (
  id text primary key,
  title text not null,
  date date not null default (now())::date,
  topics text not null default '',
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists notes_created_date_idx on public.notes (created_date desc);

alter table public.notes enable row level security;

drop policy if exists "read_all" on public.notes;
drop policy if exists "insert_all" on public.notes;
drop policy if exists "update_all" on public.notes;
drop policy if exists "delete_all" on public.notes;

create policy "read_all" on public.notes for select using (true);
create policy "insert_all" on public.notes for insert with check (true);
create policy "update_all" on public.notes for update using (true) with check (true);
create policy "delete_all" on public.notes for delete using (true);

drop trigger if exists notes_set_updated_date on public.notes;
create trigger notes_set_updated_date
before update on public.notes
for each row
execute function public.set_updated_date();