import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { request_id } = await req.json();
    const { error } = await supabaseAdmin
      .from('subscription_requests')
      .update({ status: 'REJECTED' })
      .eq('id', request_id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
