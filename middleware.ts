import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // جلب الجلسة فقط (بدون استعلامات قاعدة بيانات ثقيلة)
  const { data: { session } } = await supabase.auth.getSession()

  const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
  const isDashboardPage = req.nextUrl.pathname.startsWith('/merchant') || req.nextUrl.pathname.startsWith('/admin')

  // 1. إذا لم يكن هناك جلسة ويحاول دخول الداشبورد -> وجهه للـ Login
  if (!session && isDashboardPage) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // 2. إذا كان هناك جلسة ويحاول دخول صفحات Auth -> اترك التوجيه للـ Client أو صفحة الدخول نفسها لتجنب ثقل الميدل وير
  // أو وجهه لصفحة وسيطة /check-role
  
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)'],
}
