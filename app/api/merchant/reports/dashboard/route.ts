import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId');
  const supabase = createRouteHandlerClient({ cookies });

  const { data: sales } = await supabase.from('orders').select('total').eq('tenant_id', tenantId).eq('status', 'confirmed');
  const { data: inventory } = await supabase.from('inventory').select('quantity').eq('tenant_id', tenantId).lt('quantity', 5);

  return NextResponse.json({
    total_sales: sales?.reduce((a, b) => a + Number(b.total), 0) || 0,
    low_stock_count: inventory?.length || 0
  });
}
