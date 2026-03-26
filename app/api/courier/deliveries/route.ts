import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  const { data, error } = await supabase.from('deliveries').select('*, orders(*)').eq('courier_id', session?.user.id);
  return NextResponse.json(data || []);
}
