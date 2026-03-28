import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // 1. التحقق من الجلسة (Session)
  const { data: { session } } = await supabase.auth.getSession()

  // 2. إذا كان المسار يخص التاجر أو الإدارة، نتحقق من الـ Tenant
  if (session && (req.nextUrl.pathname.startsWith('/merchant') || req.nextUrl.pathname.startsWith('/admin'))) {
    
    // سحب بيانات المستأجر من جدول users (اللي اتأكدنا من اسمه)
    const { data: userProfile } = await supabase
      .from('users')
      .select('tenant_id, role')
      .eq('id', session.user.id)
      .single()

    if (userProfile?.tenant_id) {
      // حقن الـ Tenant ID في الرأس (Header) لسهولة الوصول إليه في الـ Server Side
      res.headers.set('x-tenant-id', userProfile.tenant_id)
      res.headers.set('x-user-role', userProfile.role)
    } else if (!req.nextUrl.pathname.startsWith('/auth')) {
      // إذا لم يكن له tenant_id، يتم توجيهه لصفحة التسجيل أو الدعم
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
