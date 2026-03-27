export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { inventoryService } from '@/services/inventoryService';

export const GET = withAuth(['merchant', 'admin'], async (_req: NextRequest, { tenant }: any) => {
  const data = await inventoryService.getStock(tenant.id);
  return NextResponse.json(data);
});

export const PATCH = withAuth(['merchant', 'admin'], async (req: NextRequest, { user, tenant }: any) => {
  const { product_id, delta, reason } = await req.json();
  if (!product_id || delta === undefined || !reason)
    return NextResponse.json({ error: 'product_id, delta, reason required' }, { status: 400 });
  const result = await inventoryService.adjustStock({ tenantId: tenant.id, productId: product_id, delta, reason, performedBy: user.id });
  return NextResponse.json(result);
});
