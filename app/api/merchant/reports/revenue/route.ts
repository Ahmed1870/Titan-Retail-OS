import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId');
  const supabase = createRouteHandlerClient({ cookies });

  const { data } = await supabase
    .from('transactions')
    .select('amount, created_at')
    .eq('tenant_id', tenantId)
    .eq('type', 'revenue');

  return NextResponse.json(data);
}
