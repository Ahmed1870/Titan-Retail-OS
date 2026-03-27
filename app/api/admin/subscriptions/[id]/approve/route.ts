export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '';
import { subscriptionService } from '@/services';

export const POST = withAuth(['admin'], async (_req: NextRequest, { user }: any, params: any) => {
  const result = await subscriptionService.approveRequest(params.id, user.id);
  return NextResponse.json(result);
});
