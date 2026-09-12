-- SwiftSupply database setup
-- Run this entire file in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), name text not null, category text not null check (category in ('Drinks','Snacks','Other')), price numeric(10,2) not null default 0 check (price >= 0), bundle_label text, description text, image_url text, stock integer not null default 0 check (stock >= 0), active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(), customer_name text not null, email text, phone text, contact_method text check (contact_method in ('email','phone','either')), order_type text not null default 'individual', notes text, items jsonb not null default '[]'::jsonb, total numeric(10,2) not null default 0, status text not null default 'new' check (status in ('new','confirmed','ready','completed','cancelled')), created_at timestamptz not null default now()
);
create table if not exists public.product_requests (
  id uuid primary key default gen_random_uuid(), name text not null, requested_product text not null, category text, notes text, email text, phone text, status text not null default 'new' check (status in ('new','reviewing','approved','declined','fulfilled')), created_at timestamptz not null default now()
);
create table if not exists public.stock_alerts (
  id uuid primary key default gen_random_uuid(), email text, phone text, product_id uuid references public.products(id) on delete cascade, channel text not null default 'email' check (channel in ('email','phone')), active boolean not null default true, created_at timestamptz not null default now(), unique(email, product_id, channel)
);
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(), title text not null, body text not null, active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.site_settings (key text primary key, value text not null);
insert into public.site_settings(key,value) values ('goal_amount','5000'),('current_amount','0') on conflict (key) do nothing;
insert into public.products(name,category,price,bundle_label,description,stock,active) values ('Monster Energy','Drinks',3.00,'2 for $5','Energy drink.',0,true),('Alani Nu','Drinks',3.00,'2 for $5','Energy drink.',0,true),('Cheetos','Snacks',3.00,null,'Snack.',0,true) on conflict do nothing;

alter table public.products enable row level security; alter table public.orders enable row level security; alter table public.product_requests enable row level security; alter table public.stock_alerts enable row level security; alter table public.announcements enable row level security; alter table public.site_settings enable row level security;

drop policy if exists "public read active products" on public.products; create policy "public read active products" on public.products for select using (active=true);
drop policy if exists "public read active announcements" on public.announcements; create policy "public read active announcements" on public.announcements for select using (active=true);
drop policy if exists "public read settings" on public.site_settings; create policy "public read settings" on public.site_settings for select using (key in ('goal_amount','current_amount'));
drop policy if exists "public create orders" on public.orders; create policy "public create orders" on public.orders for insert with check (true);
drop policy if exists "public create requests" on public.product_requests; create policy "public create requests" on public.product_requests for insert with check (true);
drop policy if exists "public create stock alerts" on public.stock_alerts; create policy "public create stock alerts" on public.stock_alerts for insert with check (true);

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select lower(coalesce(auth.jwt()->>'email',''))='winotbill@gmail.com' $$;
drop policy if exists "admin all products" on public.products; create policy "admin all products" on public.products for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all orders" on public.orders; create policy "admin all orders" on public.orders for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all requests" on public.product_requests; create policy "admin all requests" on public.product_requests for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all alerts" on public.stock_alerts; create policy "admin all alerts" on public.stock_alerts for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all announcements" on public.announcements; create policy "admin all announcements" on public.announcements for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all settings" on public.site_settings; create policy "admin all settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

-- Product image storage. The bucket is public so storefront images can load without login.
insert into storage.buckets(id,name,public) values ('product-images','product-images',true) on conflict (id) do update set public=true;
drop policy if exists "public read product images" on storage.objects; create policy "public read product images" on storage.objects for select using (bucket_id='product-images');
drop policy if exists "admin upload product images" on storage.objects; create policy "admin upload product images" on storage.objects for insert with check (bucket_id='product-images' and public.is_admin());
drop policy if exists "admin update product images" on storage.objects; create policy "admin update product images" on storage.objects for update using (bucket_id='product-images' and public.is_admin()) with check (bucket_id='product-images' and public.is_admin());
drop policy if exists "admin delete product images" on storage.objects; create policy "admin delete product images" on storage.objects for delete using (bucket_id='product-images' and public.is_admin());

create index if not exists products_active_idx on public.products(active); create index if not exists orders_status_idx on public.orders(status); create index if not exists orders_created_idx on public.orders(created_at desc); create index if not exists requests_created_idx on public.product_requests(created_at desc);
