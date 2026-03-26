import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenant_id, plan, payment_method, full_name, phone_number } = body;

    const { data, error } = await supabaseAdmin
      .from('subscription_requests')
      .insert([{
        tenant_id, 
        plan, 
        payment_method, 
        full_name, 
        phone_number,
        status: 'PENDING'
      }])
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
