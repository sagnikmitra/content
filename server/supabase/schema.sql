-- Markex base schema for Supabase
create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  username text unique,
  email text not null unique,
  password_hash text not null,
  account_type text not null default 'generic' check (account_type in ('generic', 'org')),
  organization_name text,
  name text,
  avatar_url text,
  status text not null default 'active' check (status in ('active', 'invited')),
  reset_token_hash text,
  reset_token_expiry timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  instagram text not null default '',
  discord text not null default '',
  twitter text not null default '',
  linkedin text not null default '',
  pictures jsonb not null default '[]'::jsonb,
  time timestamptz not null,
  date date not null,
  type text not null default 'static' check (type in ('static', 'video', 'live')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists app_users_set_updated_at on public.app_users;
create trigger app_users_set_updated_at
before update on public.app_users
for each row execute function public.set_updated_at();

drop trigger if exists content_items_set_updated_at on public.content_items;
create trigger content_items_set_updated_at
before update on public.content_items
for each row execute function public.set_updated_at();

create index if not exists idx_content_items_date on public.content_items(date);
create index if not exists idx_content_items_updated_at on public.content_items(updated_at desc);
