export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withWebhookAuth } from '@/lib/middleware';
import { paymentService } from '@/services';

export const POST = withWebhookAuth(async (_req: NextRequest, body: any) => {
  const result = await paymentService.handleWebhook(body);
  return NextResponse.json(result);
});
