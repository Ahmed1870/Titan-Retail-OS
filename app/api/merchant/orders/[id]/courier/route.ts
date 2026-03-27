export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { orderService } from '@/services/orderService';

export const POST = withAuth(['merchant', 'admin'], async (req: NextRequest, { user }: any, params: any) => {
  const { courier_id } = await req.json();
  const result = await orderService.assignCourier(params.id, courier_id, user.id);
  return NextResponse.json(result);
});
