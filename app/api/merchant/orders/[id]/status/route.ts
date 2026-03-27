export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { orderService } from '@/services/orderService';

export const PATCH = withAuth(['merchant', 'admin'], async (req: NextRequest, { user }: any, params: any) => {
  const { status, reason } = await req.json();
  const result = await orderService.updateStatus(params.id, status, user.id, reason);
  return NextResponse.json(result);
});
