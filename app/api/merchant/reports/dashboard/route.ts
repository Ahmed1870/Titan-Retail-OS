export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { reportService } from '@/services';

export const GET = withAuth(['merchant', 'admin'], async (_req: NextRequest, { tenant }: any) => {
  const stats = await reportService.getDashboardStats(tenant.id);
  return NextResponse.json(stats);
});
