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

create or replace function public.handle_new_user_project()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_project_id uuid;
  project_name text;
begin
  project_name := coalesce(nullif(new.raw_user_meta_data->>'business_name', ''), 'Mi negocio');
  insert into public.projects (name, owner_id)
  values (project_name, new.id)
  returning id into new_project_id;

  insert into public.project_members (project_id, user_id, role)
  values (new_project_id, new.id, 'owner');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_project on auth.users;
create trigger on_auth_user_created_project
  after insert on auth.users
  for each row execute procedure public.handle_new_user_project();

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

create or replace function public.is_project_admin(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.project_members
    where project_id = target_project_id and user_id = auth.uid() and role in ('owner','admin')
  );
$$;

drop policy if exists "members can read projects" on public.projects;
drop policy if exists "owners can create projects" on public.projects;
drop policy if exists "owners can update projects" on public.projects;
drop policy if exists "owners can delete projects" on public.projects;
drop policy if exists "users can add themselves to projects" on public.project_members;
drop policy if exists "members can read memberships" on public.project_members;
drop policy if exists "members can read products" on public.products;
drop policy if exists "members can create products" on public.products;
drop policy if exists "admins can update products" on public.products;
drop policy if exists "admins can delete products" on public.products;
drop policy if exists "members can read inventory" on public.inventory_movements;
drop policy if exists "members can create inventory" on public.inventory_movements;
drop policy if exists "admins can update inventory" on public.inventory_movements;
drop policy if exists "admins can delete inventory" on public.inventory_movements;
drop policy if exists "members can read finance" on public.financial_transactions;
drop policy if exists "members can create finance" on public.financial_transactions;
drop policy if exists "admins can update finance" on public.financial_transactions;
drop policy if exists "admins can delete finance" on public.financial_transactions;
drop policy if exists "members can read agenda" on public.agenda_events;
drop policy if exists "members can create agenda" on public.agenda_events;
drop policy if exists "admins can update agenda" on public.agenda_events;
drop policy if exists "admins can delete agenda" on public.agenda_events;

create policy "members can read projects" on public.projects for select using (public.is_project_member(id) or owner_id = auth.uid());
create policy "owners can create projects" on public.projects for insert with check (owner_id = auth.uid());
create policy "owners can update projects" on public.projects for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owners can delete projects" on public.projects for delete using (owner_id = auth.uid());
create policy "users can add themselves to projects" on public.project_members for insert with check (user_id = auth.uid());
create policy "members can read memberships" on public.project_members for select using (user_id = auth.uid() or public.is_project_member(project_id));
create policy "members can read products" on public.products for select using (public.is_project_member(project_id));
create policy "members can create products" on public.products for insert with check (public.is_project_member(project_id));
create policy "admins can update products" on public.products for update using (public.is_project_admin(project_id)) with check (public.is_project_admin(project_id));
create policy "admins can delete products" on public.products for delete using (public.is_project_admin(project_id));
create policy "members can read inventory" on public.inventory_movements for select using (public.is_project_member(project_id));
create policy "members can create inventory" on public.inventory_movements for insert with check (public.is_project_member(project_id));
create policy "admins can update inventory" on public.inventory_movements for update using (public.is_project_admin(project_id)) with check (public.is_project_admin(project_id));
create policy "admins can delete inventory" on public.inventory_movements for delete using (public.is_project_admin(project_id));
create policy "members can read finance" on public.financial_transactions for select using (public.is_project_member(project_id));
create policy "members can create finance" on public.financial_transactions for insert with check (public.is_project_member(project_id));
create policy "admins can update finance" on public.financial_transactions for update using (public.is_project_admin(project_id)) with check (public.is_project_admin(project_id));
create policy "admins can delete finance" on public.financial_transactions for delete using (public.is_project_admin(project_id));
create policy "members can read agenda" on public.agenda_events for select using (public.is_project_member(project_id));
create policy "members can create agenda" on public.agenda_events for insert with check (public.is_project_member(project_id));
create policy "admins can update agenda" on public.agenda_events for update using (public.is_project_admin(project_id)) with check (public.is_project_admin(project_id));
create policy "admins can delete agenda" on public.agenda_events for delete using (public.is_project_admin(project_id));

-- Allow project owners/admins to manage memberships (add/remove others)
drop policy if exists "admins can manage memberships" on public.project_members;
create policy "admins can manage memberships" on public.project_members for all using (public.is_project_admin(project_id)) with check (public.is_project_admin(project_id));
