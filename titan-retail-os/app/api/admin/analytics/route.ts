import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { reportService } from '@/services';

export const GET = withAuth(['admin'], async () => {
  const stats = await reportService.getAdminOverview();
  return NextResponse.json(stats);
});
