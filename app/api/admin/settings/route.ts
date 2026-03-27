import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { createServerClient } from '@/lib/supabase/server';

export const GET = withAuth(['admin'], async () => {
  const supabase = createServerClient();
  const { data } = await supabase.from('settings').select('*').order('key');
  return NextResponse.json(data ?? []);
});

export const PATCH = withAuth(['admin'], async (req: NextRequest) => {
  const { key, value } = await req.json();
  const supabase = createServerClient();
  const { error } = await supabase.from('settings').update({ value }).eq('key', key);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
});
