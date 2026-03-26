import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const { request_id } = await req.json();
  const { error } = await supabaseAdmin.from('subscription_requests').delete().eq('id', request_id).eq('status', 'PENDING');
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
