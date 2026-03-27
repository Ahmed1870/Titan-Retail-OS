import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { subscriptionService } from '@/services';

export const POST = withAuth(['admin'], async (req: NextRequest, { user }: any, params: any) => {
  const { reason } = await req.json();
  if (!reason?.trim()) return NextResponse.json({ error: 'Reason required' }, { status: 400 });
  await subscriptionService.rejectRequest(params.id, user.id, reason);
  return NextResponse.json({ success: true });
});
