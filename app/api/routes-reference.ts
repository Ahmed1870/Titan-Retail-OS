// ============================================================
// APP/API — ALL ROUTE HANDLERS
// Each section = one file. Path shown in comment.
// ============================================================

// ─── app/api/auth/register/route.ts ──────────────────────────
/*
import { createRouteHandlerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/utils';
import { referralService } from '@/services';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2),
  phone: z.string().optional(),
  store_name: z.string().min(2),
  referral_code: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!await rateLimit(`register_${ip}`, 5, 60 * 60 * 1000))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const body = schema.safeParse(await req.json());
  if (!body.success)
    return NextResponse.json({ error: body.error.message }, { status: 400 });

  const { email, password, full_name, phone, store_name, referral_code } = body.data;
  const supabase = createRouteHandlerClient({ cookies });

  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

  const userId = authData.user!.id;
  const slug = store_name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + userId.slice(0, 6);

  const { data: tenant, error: tenantError } = await supabase
    .from('tenants').insert({ store_name, slug, owner_id: userId }).select().single();
  if (tenantError) return NextResponse.json({ error: tenantError.message }, { status: 400 });

  await Promise.all([
    supabase.from('users').insert({ id: userId, tenant_id: tenant.id, role: 'merchant', full_name, phone, email }),
    supabase.from('wallets').insert({ tenant_id: tenant.id }),
  ]);

  if (referral_code) {
    try { await referralService.applyReferralCode(tenant.id, referral_code); } catch {}
  }

  return NextResponse.json({ userId, tenantId: tenant.id, slug }, { status: 201 });
}
*/

// ─── app/api/auth/login/route.ts ─────────────────────────────
/*
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return NextResponse.json({ error: error.message }, { status: 401 });

  // Fetch user profile with tenant
  const { data: user } = await supabase
    .from('users').select('*, tenants(*)').eq('id', data.user.id).single();

  return NextResponse.json({ user, session: data.session });
}
*/

// ─── app/api/auth/logout/route.ts ────────────────────────────
/*
export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
*/

// ─── app/api/auth/reset/route.ts ─────────────────────────────
/*
export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const supabase = createRouteHandlerClient({ cookies });
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
*/

// ─── app/api/merchant/orders/route.ts ────────────────────────
/*
import { withAuth } from '@/lib/middleware';
import { orderService } from '@/services/orderService';
import { validate, createOrderSchema } from '@/lib/utils';
import { rateLimit } from '@/lib/utils';

export const GET = withAuth(['merchant', 'admin'], async (req, { tenant }) => {
  const { searchParams } = new URL(req.url);
  const result = await orderService.list(tenant.id, {
    status: searchParams.get('status') as any,
    page: Number(searchParams.get('page') ?? 1),
    limit: Number(searchParams.get('limit') ?? 20),
    dateFrom: searchParams.get('from') ?? undefined,
    dateTo: searchParams.get('to') ?? undefined,
  });
  return NextResponse.json(result);
});

export const POST = withAuth(['customer'], async (req, { user, tenant }) => {
  if (!await rateLimit(`order_${user.id}`, 10, 60_000))
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const body = validate(createOrderSchema, await req.json());
  const result = await orderService.createOrder({
    tenantId: tenant.id,
    customerId: user.id,
    items: body.items,
    shippingAddress: body.shipping_address,
    deliveryFee: body.delivery_fee,
    couponCode: body.coupon_code,
    notes: body.notes,
    idempotencyKey: req.headers.get('idempotency-key') ?? undefined,
  });
  return NextResponse.json(result, { status: 201 });
});
*/

// ─── app/api/merchant/orders/[id]/status/route.ts ────────────
/*
export const PATCH = withAuth(['merchant', 'admin'], async (req, { user }, params) => {
  const { status, reason } = await req.json();
  const result = await orderService.updateStatus(params!.id, status, user.id, reason);
  return NextResponse.json(result);
});
*/

// ─── app/api/merchant/orders/[id]/courier/route.ts ───────────
/*
export const POST = withAuth(['merchant', 'admin'], async (req, { user }, params) => {
  const { courier_id } = await req.json();
  const result = await orderService.assignCourier(params!.id, courier_id, user.id);
  return NextResponse.json(result);
});
*/

// ─── app/api/merchant/products/route.ts ──────────────────────
/*
export const GET = withAuth(['merchant', 'admin'], async (req, { tenant }) => {
  const { searchParams } = new URL(req.url);
  const result = await productService.list(tenant.id, {
    category: searchParams.get('category') ?? undefined,
    search: searchParams.get('q') ?? undefined,
    active: searchParams.has('active') ? searchParams.get('active') === 'true' : undefined,
    page: Number(searchParams.get('page') ?? 1),
  });
  return NextResponse.json(result);
});

export const POST = withAuth(['merchant'], async (req, { user, tenant }) => {
  const body = validate(createProductSchema, await req.json());
  const data = await productService.create(tenant.id, user.id, body);
  return NextResponse.json(data, { status: 201 });
});
*/

// ─── app/api/merchant/products/[id]/route.ts ─────────────────
/*
export const PATCH = withAuth(['merchant', 'admin'], async (req, { user, tenant }, params) => {
  const updates = await req.json();
  const data = await productService.update(tenant.id, params!.id, user.id, updates);
  return NextResponse.json(data);
});

export const DELETE = withAuth(['merchant', 'admin'], async (req, { user, tenant }, params) => {
  await productService.softDelete(tenant.id, params!.id, user.id);
  return NextResponse.json({ success: true });
});
*/

// ─── app/api/merchant/inventory/route.ts ─────────────────────
/*
export const GET = withAuth(['merchant', 'admin'], async (req, { tenant }) => {
  const data = await inventoryService.getStock(tenant.id);
  return NextResponse.json(data);
});

export const PATCH = withAuth(['merchant', 'admin'], async (req, { user, tenant }) => {
  const { product_id, delta, reason } = await req.json();
  const result = await inventoryService.adjustStock({
    tenantId: tenant.id, productId: product_id,
    delta, reason, performedBy: user.id,
  });
  return NextResponse.json(result);
});
*/

// ─── app/api/merchant/subscriptions/request/route.ts ─────────
/*
export const POST = withAuth(['merchant'], async (req, { user, tenant }) => {
  const body = validate(subscriptionRequestSchema, await req.json());
  const result = await subscriptionService.createRequest({
    tenantId: tenant.id, requestedBy: user.id,
    plan: body.plan, paymentMethod: body.payment_method,
    fullName: body.full_name, phoneNumber: body.phone_number,
  });
  return NextResponse.json(result, { status: 201 });
});
*/

// ─── app/api/merchant/reports/dashboard/route.ts ─────────────
/*
export const GET = withAuth(['merchant', 'admin'], async (req, { tenant }) => {
  const stats = await reportService.getDashboardStats(tenant.id);
  return NextResponse.json(stats);
});
*/

// ─── app/api/merchant/reports/revenue/route.ts ───────────────
/*
export const GET = withAuth(['merchant', 'admin'], async (req, { tenant }) => {
  const days = Number(new URL(req.url).searchParams.get('days') ?? 30);
  const chart = await reportService.getRevenueChart(tenant.id, days);
  return NextResponse.json(chart);
});
*/

// ─── app/api/admin/subscriptions/route.ts ────────────────────
/*
export const GET = withAuth(['admin'], async () => {
  const data = await subscriptionService.getPendingRequests();
  return NextResponse.json(data);
});
*/

// ─── app/api/admin/subscriptions/[id]/approve/route.ts ───────
/*
export const POST = withAuth(['admin'], async (req, { user }, params) => {
  const result = await subscriptionService.approveRequest(params!.id, user.id);
  return NextResponse.json(result);
});
*/

// ─── app/api/admin/subscriptions/[id]/reject/route.ts ────────
/*
export const POST = withAuth(['admin'], async (req, { user }, params) => {
  const { reason } = await req.json();
  if (!reason?.trim()) return NextResponse.json({ error: 'Reason required' }, { status: 400 });
  await subscriptionService.rejectRequest(params!.id, user.id, reason);
  return NextResponse.json({ success: true });
});
*/

// ─── app/api/admin/tenants/route.ts ──────────────────────────
/*
export const GET = withAuth(['admin'], async (req) => {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  let query = supabase.from('tenants').select('*, subscriptions(plan, status, expires_at)').is('deleted_at', null).order('created_at', { ascending: false });
  if (searchParams.get('status')) query = query.eq('plan_status', searchParams.get('status')!);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
});
*/

// ─── app/api/admin/analytics/route.ts ────────────────────────
/*
export const GET = withAuth(['admin'], async () => {
  const stats = await reportService.getAdminOverview();
  return NextResponse.json(stats);
});
*/

// ─── app/api/admin/audit-logs/route.ts ───────────────────────
/*
export const GET = withAuth(['admin'], async (req) => {
  const { searchParams } = new URL(req.url);
  const logs = await auditService.getLogs({
    tenantId: searchParams.get('tenant_id') ?? undefined,
    resourceType: searchParams.get('resource_type') ?? undefined,
    page: Number(searchParams.get('page') ?? 1),
  });
  return NextResponse.json(logs);
});
*/

// ─── app/api/courier/deliveries/route.ts ─────────────────────
/*
export const GET = withAuth(['courier'], async (req, { user }) => {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('deliveries')
    .select('*, orders(total, shipping_address, status, order_items(quantity, products(name)))')
    .eq('courier_id', user.id)
    .order('created_at', { ascending: false });
  return NextResponse.json(data ?? []);
});
*/

// ─── app/api/courier/deliveries/[id]/update/route.ts ─────────
/*
export const PATCH = withAuth(['courier'], async (req, { user }, params) => {
  const { status, notes } = await req.json();
  const allowedStatuses = ['picked_up', 'in_transit', 'delivered', 'failed'];
  if (!allowedStatuses.includes(status))
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });

  const supabase = createServerClient();
  await supabase.from('deliveries')
    .update({ status, notes, ...(status === 'delivered' ? { delivered_at: new Date().toISOString() } : {}) })
    .eq('id', params!.id).eq('courier_id', user.id);

  // Sync order status on final delivery
  if (status === 'delivered') {
    const { data: del } = await supabase.from('deliveries').select('order_id').eq('id', params!.id).single();
    if (del) await orderService.updateStatus(del.order_id, 'delivered', user.id);
  }
  return NextResponse.json({ success: true });
});
*/

// ─── app/api/customer/orders/route.ts ────────────────────────
/*
export const GET = withAuth(['customer'], async (req, { user }) => {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, images)), deliveries(status, tracking_url)')
    .eq('customer_id', user.id).is('deleted_at', null)
    .order('created_at', { ascending: false });
  return NextResponse.json(data ?? []);
});
*/

// ─── app/api/customer/store/[slug]/products/route.ts ─────────
/*
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const supabase = createServerClient();
  const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', params.slug).eq('plan_status', 'active').single();
  if (!tenant) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  let query = supabase.from('products')
    .select('*, inventory(quantity)')
    .eq('tenant_id', tenant.id).eq('is_active', true).is('deleted_at', null);

  if (searchParams.get('category')) query = query.eq('category', searchParams.get('category')!);
  if (searchParams.get('q')) query = query.ilike('name', `%${searchParams.get('q')}%`);

  const { data } = await query;
  return NextResponse.json(data ?? []);
}
*/

// ─── app/api/webhooks/payment/route.ts ───────────────────────
/*
import { withWebhookAuth } from '@/lib/middleware';

export const POST = withWebhookAuth(async (req, body) => {
  const result = await paymentService.handleWebhook(body as any);
  return NextResponse.json(result);
});
*/

export {};
