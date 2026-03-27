export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { subscriptionService } from '@/services';

export const GET = withAuth(['admin'], async () => {
  const data = await subscriptionService.getPendingRequests();
  return NextResponse.json(data);
});
