import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  // إذا كان المستخدم مسجل دخول ويحاول الوصول لصفحة الهبوط أو Login
  if (session && (req.nextUrl.pathname === '/' || req.nextUrl.pathname.startsWith('/auth'))) {
    const { data: profile } = await supabase
      .from('users')
      .select('tenant_id, role')
      .eq('id', session.user.id)
      .single()

    // توجيه ذكي بناءً على الدور
    if (profile?.role === 'merchant') {
      return NextResponse.redirect(new URL('/merchant/dashboard', req.url))
    } else if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
  }

  // حماية المسارات الحساسة
  if (!session && (req.nextUrl.pathname.startsWith('/merchant') || req.nextUrl.pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)'],
}
