import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const { email } = await req.json();
  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email);
  return NextResponse.json({ sent: !error });
}
