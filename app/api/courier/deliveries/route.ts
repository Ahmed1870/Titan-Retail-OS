export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { createClient } from '@/lib/supabase/server';

export const GET = withAuth(['courier'], async (_req: NextRequest, { user }: any) => {
  const supabase = createClient();
  const { data } = await supabase.from('deliveries')
    .select('*, orders(id, total, shipping_address, status, order_items(quantity, products(name, images)))')
    .eq('courier_id', user.id).order('created_at', { ascending: false });
  return NextResponse.json(data ?? []);
});
