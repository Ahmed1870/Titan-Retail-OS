import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    'https://uyglhsoafegkickjfoik.supabase.co',
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

  // إذا كان مسجل دخول ويحاول دخول صفحة اللوجن أو اللاندنج
  if (session && (path === '/' || path.startsWith('/auth'))) {
    const { data: user } = await supabase.from('users').select('role').eq('id', session.user.id).single()
    
    // التوجيه بناءً على الـ Role الفعلي في السكيما
    if (user?.role === 'merchant') return NextResponse.redirect(new URL('/merchant', request.url))
    if (user?.role === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
    if (user?.role === 'courier') return NextResponse.redirect(new URL('/courier', request.url))
  }

  // حماية المسارات (إذا لم يكن هناك جلسة)
  const protectedRoutes = ['/merchant', '/admin', '/courier']
  if (!session && protectedRoutes.some(route => path.startsWith(route))) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
