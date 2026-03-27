import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { referralService } from '@/services';

export const GET = withAuth(['merchant'], async (_req: NextRequest, { tenant }: any) => {
  const stats = await referralService.getStats(tenant.id);
  return NextResponse.json(stats);
});
