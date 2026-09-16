-- SwiftSupply: brand-level stock alerts
-- Run this once in the Supabase SQL Editor.

alter table public.stock_alerts
  add column if not exists brand text;

-- Existing flavor subscriptions can remain in the table, but new subscriptions
-- use brand instead of product_id.
create unique index if not exists stock_alerts_email_brand_channel_unique
  on public.stock_alerts (lower(email), lower(brand), channel)
  where email is not null and brand is not null;

create index if not exists stock_alerts_brand_active_idx
  on public.stock_alerts (lower(brand), active)
  where brand is not null;
