export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { productService } from '@/services';

export const PATCH = withAuth(['merchant', 'admin'], async (req: NextRequest, { user, tenant }: any, params: any) => {
  const updates = await req.json();
  const data = await productService.update(tenant.id, params.id, user.id, updates);
  return NextResponse.json(data);
});

export const DELETE = withAuth(['merchant', 'admin'], async (req: NextRequest, { user, tenant }: any, params: any) => {
  await productService.softDelete(tenant.id, params.id, user.id);
  return NextResponse.json({ success: true });
});
