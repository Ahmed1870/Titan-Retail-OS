# Titan Retail OS v2.0

Multi-tenant SaaS ERP + Marketplace + Delivery platform.

## Stack
- **Frontend**: Next.js 14 App Router + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage + RLS)
- **Deployment**: Vercel

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.local.example .env.local
# Fill in your Supabase credentials

# 3. Apply database schema (Supabase Studio or CLI)
supabase db push < database/schema.sql

# 4. Run development server
npm run dev
```

## Deployment (Termux)
```bash
pkg install nodejs git
npm install -g vercel
vercel --prod
```

## Architecture
- `app/` — Next.js pages and API routes
- `services/` — All business logic (no logic in routes)
- `lib/` — Supabase clients, middleware, utilities
- `components/` — React UI components per role
- `hooks/` — Realtime + state hooks
- `database/` — Full SQL schema with RLS + RPC functions
- `types/` — TypeScript types

## User Roles
| Role | Dashboard |
|------|-----------|
| admin | /admin — manage tenants, approve subscriptions |
| merchant | /merchant — store management |
| courier | /courier — delivery tracking |
| customer | /store/[slug] — shopping |

## Subscription Flow
1. Merchant selects plan → fills payment form
2. System creates `subscription_requests` (PENDING)
3. Redirect to WhatsApp with pre-filled message
4. Admin sees real-time shake notification → approves
5. `approve_subscription()` RPC atomically activates tenant
6. Merchant UI detects activation via Supabase Realtime — no refresh
