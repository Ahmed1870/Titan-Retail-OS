import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { status } = await req.json();
  
  const { error } = await supabase.from('deliveries').update({ status }).eq('id', params.id);
  
  if (status === 'delivered') {
    await supabase.from('orders').update({ status: 'delivered', delivered_at: new Date().toISOString() }).eq('id', params.id);
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
