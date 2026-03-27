import { createClient } from './supabase/server'
import { NextResponse } from 'next/server'

// وظيفة التحقق من الهوية (withAuth) المتوافقة مع السكيما
export async function withAuth(role?: string) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: 'Unauthorized', status: 401 }
  }

  if (role) {
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (user?.role !== role) {
      return { error: 'Forbidden', status: 403 }
    }
  }

  return { supabase, session }
}

// وظيفة التحقق من الـ Webhooks (withWebhookAuth)
export async function withWebhookAuth(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.PROJECT_KEY_PRIVATE}`) {
    return { error: 'Invalid Webhook Key', status: 401 }
  }
  return { authorized: true }
}
