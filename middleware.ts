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

  // 1. المسارات التي تتطلب تسجيل دخول (Protected Routes)
  const protectedPaths = ['/merchant', '/admin', '/courier', '/store']
  const isProtected = protectedPaths.some(p => path.startsWith(p))

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // 2. إعادة توجيه المسجلين دخول بعيداً عن صفحات الـ Auth (لو مسجل ميروحش يسجل تاني)
  if (session && (path.startsWith('/auth/login') || path.startsWith('/auth/register'))) {
    return NextResponse.redirect(new URL('/merchant', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
