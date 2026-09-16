-- SwiftSupply: secure unsubscribe links for brand stock alerts
alter table public.stock_alerts
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid();

create unique index if not exists stock_alerts_unsubscribe_token_unique
  on public.stock_alerts (unsubscribe_token);
