# SwiftSupply connected setup

The frontend is hosted on GitHub Pages and uses Supabase for the database/authentication.

## 1. Configure the public Supabase key

Open `js/config.js` and replace:

`PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE`

with the Supabase **publishable/anon key** from your project. This key is allowed in browser code. Do not put a Supabase service-role key or any Resend secret in this file.

## 2. Create the database

In Supabase Dashboard → SQL Editor, run the complete contents of:

`supabase/schema.sql`

This creates products, orders, product requests, stock alerts, announcements, and site settings, plus row-level security policies.

## 3. Create the admin login

In Supabase Dashboard → Authentication → Users, create the admin user with the authorized email configured in `js/config.js` (`winotbill@gmail.com`) and a password you choose.

The admin page is:

`/SwiftSupply/admin/`

Only that configured email is accepted by the dashboard.

## 4. Resend

Never put the Resend API key in GitHub or browser JavaScript. The included Edge Function expects these Supabase secrets:

- `RESEND_API_KEY` = your current Resend secret key
- `RESEND_FROM` = an address on your verified `yucai.org` domain, such as `SwiftSupply <noreply@yucai.org>`

Because the Resend key was pasted into a chat, revoke that exposed key and create a replacement before configuring the function.

The Edge Function source is at `supabase/functions/send-email/index.ts`.

## 5. GitHub Pages

Keep using the existing GitHub Pages address:

`https://willn0tbill.github.io/SwiftSupply/`

No custom website domain is required.

## Current connected features

- Live product catalog
- Live inventory page
- Product requests saved to Supabase
- Order requests saved to Supabase
- Stock-alert subscriptions saved to Supabase
- Public announcements from the admin dashboard
- Live $5,000 goal and progress
- Admin product/inventory management
- Admin order status management
- Admin product-request status management
- Admin announcements
- Admin goal management

Payments are intentionally not included: orders are requests for review rather than an online checkout.
