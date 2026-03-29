import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await req.json();
  const { tenant_id, plan_id, status } = body;

  if (status === 'paid') {
    const { error } = await supabase
      .from('subscriptions')
      .update({ plan_id, status: 'active', updated_at: new Date() })
      .eq('tenant_id', tenant_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ message: 'Unhandled status' });
}
