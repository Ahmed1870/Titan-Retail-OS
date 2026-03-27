export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { createServerClient } from '@/lib/supabase/server';
import { orderService } from '@/services/orderService';

export const PATCH = withAuth(['courier'], async (req: NextRequest, { user }: any, params: any) => {
  const { status, notes } = await req.json();
  const allowed = ['picked_up', 'in_transit', 'delivered', 'failed'];
  if (!allowed.includes(status))
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  const supabase = createServerClient();
  await supabase.from('deliveries').update({
    status, notes: notes ?? null,
    ...(status === 'delivered' ? { delivered_at: new Date().toISOString() } : {}),
    ...(status === 'picked_up' ? { pickup_at: new Date().toISOString() } : {}),
  }).eq('id', params.id).eq('courier_id', user.id);
  if (status === 'delivered') {
    const { data: del } = await supabase.from('deliveries').select('order_id').eq('id', params.id).single();
    if (del) await orderService.updateStatus(del.order_id, 'delivered', user.id);
  }
  return NextResponse.json({ success: true });
});
