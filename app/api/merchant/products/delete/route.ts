import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
  return NextResponse.json({ success: !error });
}
