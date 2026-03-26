import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { request_id, tenant_id, plan } = await req.json();
    const { data, error } = await supabaseAdmin.rpc('approve_subscription', {
      req_id: request_id,
      t_id: tenant_id,
      new_plan: plan
    });
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
