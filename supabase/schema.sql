create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  primary key (project_id, user_id)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  code text not null,
  name text not null,
  sale_price numeric(14, 2) not null check (sale_price > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (project_id, code)
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  movement_type text not null check (movement_type in ('entry', 'exit')),
  quantity integer not null check (quantity > 0),
  movement_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  title text not null,
  client text not null,
  quantity integer not null check (quantity > 0),
  category text not null,
  transaction_type text not null check (transaction_type in ('income', 'expense')),
  account text not null,
  amount numeric(14, 2) not null check (amount >= 0),
  transaction_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.agenda_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  client text not null,
  event_type text not null check (event_type in ('reunion', 'tarea', 'recordatorio')),
  event_date date not null,
  event_time time not null,
  duration text not null,
  location text not null,
  status text not null default 'pendiente' check (status in ('confirmada', 'pendiente')),
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.products enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.financial_transactions enable row level security;
alter table public.agenda_events enable row level security;

create or replace function public.is_project_member(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.project_members
    where project_id = target_project_id and user_id = auth.uid()
  );
$$;

create policy "members can read projects" on public.projects for select using (public.is_project_member(id) or owner_id = auth.uid());
create policy "owners can create projects" on public.projects for insert with check (owner_id = auth.uid());
create policy "members can read products" on public.products for select using (public.is_project_member(project_id));
create policy "members can manage products" on public.products for all using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));
create policy "members can read inventory" on public.inventory_movements for select using (public.is_project_member(project_id));
create policy "members can manage inventory" on public.inventory_movements for all using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));
create policy "members can read finance" on public.financial_transactions for select using (public.is_project_member(project_id));
create policy "members can manage finance" on public.financial_transactions for all using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));
create policy "members can read agenda" on public.agenda_events for select using (public.is_project_member(project_id));
create policy "members can manage agenda" on public.agenda_events for all using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));
