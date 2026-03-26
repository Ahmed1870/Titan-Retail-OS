import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const { email, name, phone } = await req.json();
  const { data, error } = await supabaseAdmin.auth.admin.createUser({ email, password: 'TitanCourier123!', email_confirm: true });
  await supabaseAdmin.from('couriers').insert({ user_id: data.user?.id, name, phone });
  return NextResponse.json({ success: true });
}
