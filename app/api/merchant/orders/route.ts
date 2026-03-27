export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { orderService } from '@/services/orderService';
import { validate, createOrderSchema } from '@/lib/utils';
import { rateLimit } from '@/lib/utils';

export const GET = withAuth(['merchant', 'admin'], async (req: NextRequest, { tenant }: any) => {
  const { searchParams } = new URL(req.url);
  const result = await orderService.list(tenant.id, {
    status: (searchParams.get('status') as any) ?? undefined,
    page: Number(searchParams.get('page') ?? 1),
    limit: Number(searchParams.get('limit') ?? 20),
    dateFrom: searchParams.get('from') ?? undefined,
    dateTo: searchParams.get('to') ?? undefined,
  });
  return NextResponse.json(result);
});

export const POST = withAuth(['customer'], async (req: NextRequest, { user, tenant }: any) => {
  if (!await rateLimit(`order_${user.id}`, 10, 60_000))
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  const body = validate(createOrderSchema, await req.json());
  const result = await orderService.createOrder({
    tenantId: tenant.id, customerId: user.id,
    items: body.items, shippingAddress: body.shipping_address as any,
    deliveryFee: body.delivery_fee, couponCode: body.coupon_code, notes: body.notes,
    idempotencyKey: req.headers.get('idempotency-key') ?? undefined,
  });
  return NextResponse.json(result, { status: 201 });
});
