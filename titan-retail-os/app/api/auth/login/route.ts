import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!await rateLimit(`login_${ip}`, 10, 60 * 1000))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { email, password } = await req.json();
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return NextResponse.json({ error: error.message }, { status: 401 });

  const { data: user } = await supabase
    .from('users').select('*, tenants(*)').eq('id', data.user.id).single();

  return NextResponse.json({ user, session: data.session });
}
