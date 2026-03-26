import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const walletId = searchParams.get('walletId');
  const { data } = await supabaseAdmin.from('wallet_transactions').select('*').eq('wallet_id', walletId).order('created_at', { ascending: false });
  return NextResponse.json(data);
}
