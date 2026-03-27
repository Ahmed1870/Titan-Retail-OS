import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.PROJECT_LINK_FINAL!,
    process.env.PROJECT_KEY_PUBLIC!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const path = request.nextUrl.pathname

  // 1. السماح لصفحات الـ Auth والـ API والـ Static Files
  if (path.startsWith('/auth') || path.startsWith('/api') || path === '/' || path.includes('.')) {
    return response
  }

  // 2. حماية المسارات (Protected Routes) بناءً على السكيما
  const protectedConfigs = [
    { prefix: '/merchant', role: 'merchant' },
    { prefix: '/admin', role: 'admin' },
    { prefix: '/courier', role: 'courier' },
    { prefix: '/store', role: 'customer' }
  ]

  const currentConfig = protectedConfigs.find(c => path.startsWith(c.prefix))

  if (currentConfig) {
    if (!session) return NextResponse.redirect(new URL('/auth/login', request.url))

    // التحقق من الـ Role من جدول users في السكيما (Section 4)
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!user || user.role !== currentConfig.role) {
      // إذا كان مسجل دخول بس داخل مكان غلط (مثلاً Merchant بيحاول يدخل Admin)
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
