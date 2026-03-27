export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { subscriptionService } from '@/services';
import { validate, subscriptionRequestSchema } from '@/lib/utils';

export const POST = withAuth(['merchant'], async (req: NextRequest, { user, tenant }: any) => {
  const body = validate(subscriptionRequestSchema, await req.json());
  const result = await subscriptionService.createRequest({
    tenantId: tenant.id, requestedBy: user.id,
    plan: body.plan, paymentMethod: body.payment_method,
    fullName: body.full_name, phoneNumber: body.phone_number,
  });
  return NextResponse.json(result, { status: 201 });
});
