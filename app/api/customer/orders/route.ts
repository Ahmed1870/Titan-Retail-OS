export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { createServerClient } from '@/lib/supabase/server';

export const GET = withAuth(['customer'], async (_req: NextRequest, { user }: any) => {
  const supabase = createServerClient();
  const { data } = await supabase.from('orders')
    .select('*, order_items(*, products(name, images)), deliveries(status, tracking_url)')
    .eq('customer_id', user.id).is('deleted_at', null)
    .order('created_at', { ascending: false });
  return NextResponse.json(data ?? []);
});
