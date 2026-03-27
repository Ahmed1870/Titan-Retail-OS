import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

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

  // 1. المسارات المحمية (تتطلب تسجيل دخول)
  const protectedPaths = ['/merchant', '/admin', '/courier', '/store']
  const isProtected = protectedPaths.some(p => path.startsWith(p))

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // 2. المسارات العامة (يُسمح للجميع بدخولها حتى لو مسجل دخول أو لا)
  // تشمل اللاندنج بيدج وصفحات الاستعادة والـ API الخاص بها
  const publicPaths = ['/auth/forgot-password', '/auth/reset-password', '/api/auth/reset']
  const isPublic = publicPaths.some(p => path.startsWith(p))

  // 3. منع المسجلين دخول من العودة لصفحات الـ Login/Register
  if (session && (path === '/auth/login' || path === '/auth/register')) {
    return NextResponse.redirect(new URL('/merchant', request.url))
  }

  return response
}

export const config = {
  // استثناء الملفات الساكنة والـ API من الفحص لسرعة الأداء
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
