import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const { data: { user } } = await supabase.auth.getUser()

    const isDashboardPage =
      req.nextUrl.pathname.startsWith('/merchant') ||
      req.nextUrl.pathname.startsWith('/admin')

    if (!user && isDashboardPage) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    return res
  } catch (e) {
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
