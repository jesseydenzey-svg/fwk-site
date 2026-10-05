create extension if not exists "pgcrypto";

create table if not exists public.price_tiers (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  price integer not null check (price > 0),
  is_preorder boolean not null default false
);

create table if not exists public.iphone_models (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null unique,
  price_tier_id uuid not null references public.price_tiers(id) on delete restrict
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  image_url text,
  category_id uuid references public.categories(id) on delete set null,
  product_type text not null check (product_type in ('case', 'other', 'bracelet')),
  price integer check (product_type = 'case' or price is not null),
  availability_status text not null default 'in_stock' check (availability_status in ('in_stock', 'preorder')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_models (
  product_id uuid not null references public.products(id) on delete cascade,
  model_id uuid not null references public.iphone_models(id) on delete cascade,
  primary key (product_id, model_id)
);

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists product_models_model_id_idx on public.product_models(model_id);

alter table public.price_tiers enable row level security;
alter table public.iphone_models enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_models enable row level security;

create policy "Public can read price tiers" on public.price_tiers for select using (true);
create policy "Public can read iPhone models" on public.iphone_models for select using (true);
create policy "Public can read categories" on public.categories for select using (true);
create policy "Public can read active products" on public.products for select using (is_active = true);
create policy "Public can read product models" on public.product_models for select using (true);