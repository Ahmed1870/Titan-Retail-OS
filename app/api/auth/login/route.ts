import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    
    // نظام الحماية من التكرار
    const isRateLimited = await rateLimit(`login_${ip}`, 10, 60 * 1000);
    if (!isRateLimited) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { email, password } = await req.json();
    
    // التصحيح الجوهري لـ Next.js 14
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // جلب بيانات المستخدم والتاجر المرتبط به
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*, tenants(*)')
      .eq('id', data.user.id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User data not found' }, { status: 404 });
    }

    return NextResponse.json({ user, session: data.session });

  } catch (err) {
    console.error('Login Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
