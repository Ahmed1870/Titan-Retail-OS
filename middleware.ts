import { createServerClient, type NextRequest } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 1. حماية المسارات الإدارية (Admin/Merchant)
  if (!user && (request.nextUrl.pathname.startsWith('/merchant') || request.nextUrl.pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    // جلب الدور (Role) من جدول users المطابق للسكيما v2.0
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = userData?.role

    // توجيه الأدمن (SuperAdmin)
    if (request.nextUrl.pathname.startsWith('/merchant') && role === 'admin') {
      return NextResponse.redirect(new URL('/admin/superadmin', request.url))
    }

    // منع التاجر من دخول لوحة الأدمن
    if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/merchant/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/merchant/:path*', '/admin/:path*', '/login'],
}
