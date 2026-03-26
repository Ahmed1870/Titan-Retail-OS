# TITAN-RETAIL OS — PROJECT GUIDE v2.0

## Directory Structure

```
titan-retail-os/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (admin)/
│   │   └── admin/
│   │       ├── layout.tsx        # Admin auth guard
│   │       ├── page.tsx          # → AdminDashboard.jsx
│   │       ├── tenants/page.tsx
│   │       ├── subscriptions/page.tsx
│   │       └── analytics/page.tsx
│   ├── (merchant)/
│   │   └── dashboard/
│   │       ├── layout.tsx        # Merchant auth guard
│   │       ├── page.tsx          # → MerchantDashboard.jsx
│   │       ├── products/page.tsx
│   │       ├── orders/page.tsx
│   │       ├── inventory/page.tsx
│   │       └── reports/page.tsx
│   ├── (courier)/
│   │   └── courier/
│   │       └── page.tsx
│   ├── (customer)/
│   │   └── store/[slug]/
│   │       └── page.tsx          # Public storefront
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts
│       │   ├── login/route.ts
│       │   └── reset/route.ts
│       ├── merchant/
│       │   ├── orders/route.ts
│       │   ├── orders/[id]/status/route.ts
│       │   ├── products/route.ts
│       │   ├── products/[id]/route.ts
│       │   ├── inventory/route.ts
│       │   ├── subscriptions/request/route.ts
│       │   ├── reports/dashboard/route.ts
│       │   └── reports/revenue/route.ts
│       ├── admin/
│       │   ├── tenants/route.ts
│       │   ├── subscriptions/route.ts
│       │   ├── subscriptions/[id]/approve/route.ts
│       │   ├── subscriptions/[id]/reject/route.ts
│       │   └── analytics/route.ts
│       ├── courier/
│       │   ├── deliveries/route.ts
│       │   └── deliveries/[id]/update/route.ts
│       ├── customer/
│       │   ├── orders/route.ts
│       │   └── store/[slug]/products/route.ts
│       └── webhooks/
│           └── payment/route.ts
├── services/                     # Business logic layer
│   ├── orderService.ts
│   ├── inventoryService.ts
│   ├── subscriptionService.ts
│   ├── referralService.ts
│   ├── paymentService.ts
│   ├── reportService.ts
│   ├── auditService.ts
│   └── notificationService.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   └── server.ts             # Server/service role client
│   ├── middleware.ts             # withAuth() wrapper
│   ├── rateLimit.ts
│   ├── featureFlags.ts
│   └── validate.ts
├── database/
│   └── schema.sql                # ← Full schema file
└── hooks/
    ├── useRealtimeSubscriptions.ts
    ├── useRealtimeOrders.ts
    └── useNotifications.ts
```

---

## Environment Variables (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_WHATSAPP_NUMBER=201019672878
WEBHOOK_SECRET=your-webhook-secret
```

---

## Supabase Setup

### 1. Create Project
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize
supabase init
supabase login
supabase link --project-ref your-project-ref
```

### 2. Run Schema
```bash
# Apply the full schema
supabase db push < database/schema.sql

# Or via Supabase Studio SQL editor
# Paste contents of database/schema.sql
```

### 3. Enable Realtime
In Supabase Dashboard → Database → Replication → Add tables:
- `subscription_requests`
- `notifications`
- `orders`
- `tenants`

---

## Realtime Hooks

### useRealtimeSubscriptions.ts
```typescript
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useRealtimeSubscriptions() {
  const [requests, setRequests] = useState([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Initial fetch
    const fetch = async () => {
      const { data } = await supabase
        .from('subscription_requests')
        .select('*, tenants(store_name)')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: true })
      setRequests(data ?? [])
    }
    fetch()

    // Subscribe to new requests (admin)
    const channel = supabase
      .channel('sub_requests')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'subscription_requests',
      }, (payload) => {
        setRequests(prev => [payload.new, ...prev])
        // Trigger shake animation + sound
        new Audio('/alert.mp3').play().catch(() => {})
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return requests
}
```

### useMerchantActivation.ts (Merchant side)
```typescript
export function useMerchantActivation(tenantId: string) {
  const [activated, setActivated] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const channel = supabase
      .channel(`tenant_${tenantId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tenants',
        filter: `id=eq.${tenantId}`,
      }, (payload) => {
        if (payload.new.plan_status === 'active') {
          setActivated(true)
          // Show success toast, unlock UI
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tenantId])

  return activated
}
```

---

## Deployment (Vercel + Termux)

### From Termux
```bash
# Install Node
pkg install nodejs git

# Clone & setup
git clone your-repo
cd titan-retail-os
npm install

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Vercel Config (vercel.json)
```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-key"
  }
}
```

---

## Key Architecture Decisions

### 1. No Logic in Routes
All routes call services. Services call RPC or Supabase. Zero raw SQL in routes.

### 2. Immutable Records
- `transactions` — no updated_at, no deletes
- `invoices` — no deletes, stored as snapshots
- `audit_logs` — append-only forever

### 3. Atomic Order Creation
`create_order()` RPC handles everything in one transaction:
order → items → stock decrement → inventory_log → transaction → invoice → notification

### 4. Subscription Flow
```
Merchant fills form
  → INSERT subscription_requests (PENDING)
  → Redirect to WhatsApp

Admin sees realtime shake animation
  → Clicks Approve
  → approve_subscription() RPC:
      UPDATE tenants (plan_status = active)
      UPSERT subscriptions
      INSERT transaction
      INSERT audit_log
      INSERT notification (realtime to merchant)

Merchant UI detects tenant.plan_status = 'active'
  → Toast shown, features unlocked, no reload
```

### 5. Rate Limiting
Uses `cache_entries` table as distributed rate limit store.
Keys: `ratelimit_{resource}_{userId}_{windowBucket}`

### 6. Idempotency
Every financial mutation accepts `idempotency-key` header.
Duplicate requests within 24h return the original response.

### 7. Soft Deletes
All main tables use `deleted_at` timestamp.
All queries filter `WHERE deleted_at IS NULL`.
RLS policies enforce this at DB level.

---

## Security Checklist

- [x] RLS enabled on all tables
- [x] Service role key only on server
- [x] Rate limiting on auth + orders endpoints
- [x] Input validation before service calls
- [x] Idempotency keys on all financial writes
- [x] Audit log on every admin action
- [x] Transactions are immutable (no UPDATE/DELETE)
- [x] Invoices are immutable snapshots
- [x] Tenant isolation enforced via RLS + tenant_id
- [x] JWT sessions via Supabase Auth
- [x] Webhook signature verification
