// ============================================================
// TITAN-RETAIL OS — API ROUTES (Next.js App Router)
// File structure mirrors /api/* paths
// ============================================================

// ============================================================
// app/api/auth/register/route.ts
// ============================================================
/*
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { referralService } from '@/services'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const allowed = await rateLimit(`register_${ip}`, 5, 60 * 60 * 1000) // 5/hour
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const { email, password, full_name, phone, store_name, referral_code } = await req.json()

  if (!email || !password || !full_name || !store_name)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  const supabase = createRouteHandlerClient({ cookies })

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  const userId = authData.user!.id

  // 2. Create tenant
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .insert({ store_name, owner_id: userId })
    .select()
    .single()

  if (tenantError) return NextResponse.json({ error: tenantError.message }, { status: 400 })

  // 3. Create user profile
  await supabase.from('users').insert({
    id: userId,
    tenant_id: tenant.id,
    role: 'merchant',
    full_name,
    phone,
    email,
  })

  // 4. Create wallet
  await supabase.from('wallets').insert({ tenant_id: tenant.id })

  // 5. Apply referral code if provided
  if (referral_code) {
    try { await referralService.applyReferralCode(tenant.id, referral_code) }
    catch { /* Non-blocking */ }
  }

  return NextResponse.json({ userId, tenantId: tenant.id })
}
*/

// ============================================================
// app/api/merchant/orders/route.ts
// ============================================================
/*
import { withAuth } from '@/lib/middleware'
import { orderService } from '@/services'
import { rateLimit } from '@/lib/rateLimit'

export const GET = withAuth(['merchant', 'admin'], async (req, { user, tenant }) => {
  const { searchParams } = new URL(req.url)
  const result = await orderService.listOrders(tenant.id, {
    status: searchParams.get('status') as any,
    page: Number(searchParams.get('page') ?? 1),
    limit: Number(searchParams.get('limit') ?? 20),
  })
  return NextResponse.json(result)
})

export const POST = withAuth(['customer'], async (req, { user, tenant }) => {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const allowed = await rateLimit(`order_${user.id}`, 10, 60 * 1000) // 10/min
  if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  const body = await req.json()
  validateOrderPayload(body)

  const result = await orderService.createOrder({
    tenantId: tenant.id,
    customerId: user.id,
    ...body,
    idempotencyKey: req.headers.get('idempotency-key') ?? undefined,
  })

  return NextResponse.json(result, { status: 201 })
})
*/

// ============================================================
// app/api/merchant/orders/[id]/status/route.ts
// ============================================================
/*
export const PATCH = withAuth(['merchant', 'admin'], async (req, { user }, { params }) => {
  const { status, reason } = await req.json()
  const result = await orderService.updateStatus(params.id, status, user.id, reason)
  return NextResponse.json(result)
})
*/

// ============================================================
// app/api/merchant/subscriptions/request/route.ts
// ============================================================
/*
export const POST = withAuth(['merchant'], async (req, { user, tenant }) => {
  const body = await req.json()
  const result = await subscriptionService.createRequest({
    tenantId: tenant.id,
    requestedBy: user.id,
    plan: body.plan,
    paymentMethod: body.payment_method,
    fullName: body.full_name,
    phoneNumber: body.phone_number,
  })
  return NextResponse.json(result, { status: 201 })
})
*/

// ============================================================
// app/api/admin/subscriptions/[id]/approve/route.ts
// ============================================================
/*
export const POST = withAuth(['admin'], async (req, { user }, { params }) => {
  const result = await subscriptionService.approveRequest(params.id, user.id)
  return NextResponse.json(result)
})
*/

// ============================================================
// app/api/admin/subscriptions/[id]/reject/route.ts
// ============================================================
/*
export const POST = withAuth(['admin'], async (req, { user }, { params }) => {
  const { reason } = await req.json()
  await subscriptionService.rejectRequest(params.id, user.id, reason)
  return NextResponse.json({ success: true })
})
*/

// ============================================================
// app/api/merchant/products/route.ts
// ============================================================
/*
export const GET = withAuth(['merchant'], async (req, { tenant }) => {
  const { searchParams } = new URL(req.url)
  const query = supabase.from('products')
    .select('*, inventory(quantity, reserved_quantity, low_stock_threshold)')
    .eq('tenant_id', tenant.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (searchParams.get('category')) query.eq('category', searchParams.get('category'))
  if (searchParams.get('q')) query.ilike('name', `%${searchParams.get('q')}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
})

export const POST = withAuth(['merchant'], async (req, { user, tenant }) => {
  const body = await req.json()
  const { data, error } = await supabase.from('products')
    .insert({ ...body, tenant_id: tenant.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Auto-create inventory record
  await supabase.from('inventory').insert({
    tenant_id: tenant.id,
    product_id: data.id,
    quantity: body.initial_stock ?? 0,
  })

  await auditService.log({
    tenantId: tenant.id,
    performedBy: user.id,
    action: 'CREATE',
    resourceType: 'product',
    resourceId: data.id,
  })

  return NextResponse.json(data, { status: 201 })
})
*/

// ============================================================
// app/api/merchant/reports/dashboard/route.ts
// ============================================================
/*
export const GET = withAuth(['merchant', 'admin'], async (req, { tenant }) => {
  const stats = await reportService.getDashboardStats(tenant.id)
  return NextResponse.json(stats)
})
*/

// ============================================================
// app/api/merchant/reports/revenue/route.ts
// ============================================================
/*
export const GET = withAuth(['merchant', 'admin'], async (req, { tenant }) => {
  const { searchParams } = new URL(req.url)
  const days = Number(searchParams.get('days') ?? 30)
  const chart = await reportService.getRevenueChart(tenant.id, days)
  return NextResponse.json(chart)
})
*/

// ============================================================
// app/api/courier/deliveries/route.ts
// ============================================================
/*
export const GET = withAuth(['courier'], async (req, { user }) => {
  const { data } = await supabase.from('deliveries')
    .select('*, orders(total, shipping_address, status)')
    .eq('courier_id', user.id)
    .order('created_at', { ascending: false })
  return NextResponse.json(data)
})
*/

// ============================================================
// app/api/courier/deliveries/[id]/update/route.ts
// ============================================================
/*
export const PATCH = withAuth(['courier'], async (req, { user }, { params }) => {
  const { status } = await req.json()
  await supabase.from('deliveries').update({ status }).eq('id', params.id).eq('courier_id', user.id)
  return NextResponse.json({ success: true })
})
*/

// ============================================================
// app/api/customer/orders/route.ts
// ============================================================
/*
export const GET = withAuth(['customer'], async (req, { user }) => {
  const { data } = await supabase.from('orders')
    .select('*, order_items(*, products(name, images)), deliveries(status, tracking_url)')
    .eq('customer_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  return NextResponse.json(data)
})
*/

// ============================================================
// app/api/admin/tenants/route.ts
// ============================================================
/*
export const GET = withAuth(['admin'], async (req) => {
  const { data } = await supabase.from('tenants')
    .select('*, subscriptions(plan, status, expires_at)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  return NextResponse.json(data)
})
*/

// ============================================================
// app/api/webhooks/payment/route.ts
// ============================================================
/*
export async function POST(req: NextRequest) {
  // Verify webhook signature
  const signature = req.headers.get('x-webhook-signature')
  // ... signature verification logic

  const body = await req.json()
  const result = await paymentService.handleWebhook(body)
  return NextResponse.json(result)
}
*/

// ============================================================
// lib/middleware.ts — Auth guard wrapper
// ============================================================
/*
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

type Role = 'admin' | 'merchant' | 'courier' | 'customer'

export function withAuth(
  allowedRoles: Role[],
  handler: (req: NextRequest, ctx: { user: any; tenant: any }, params?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, params?: any) => {
    try {
      const supabase = createRouteHandlerClient({ cookies })
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

      const { data: user } = await supabase
        .from('users')
        .select('*, tenants(*)')
        .eq('id', session.user.id)
        .single()

      if (!user || !allowedRoles.includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      return await handler(req, { user, tenant: user.tenants }, params)
    } catch (err) {
      if (err instanceof ServiceError) {
        return NextResponse.json({ error: err.message, code: err.code }, { status: 400 })
      }
      console.error('[API Error]', err)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}
*/

export {}
