export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { createServerClient } from '@/lib/supabase/server';

export const GET = withAuth(['admin'], async (req: NextRequest) => {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  let query = supabase.from('tenants')
    .select('*, subscriptions(plan, status, expires_at), users!owner_id(full_name, email)')
    .is('deleted_at', null).order('created_at', { ascending: false });
  if (searchParams.get('status')) query = query.eq('plan_status', searchParams.get('status')!);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
});
