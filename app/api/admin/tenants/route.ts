import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { DatabaseError, AuthError } from '@/lib/errors'

export async function GET() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new AuthError("UNAUTHORIZED_ACCESS")

  const { data: adminCheck } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (adminCheck?.role !== 'admin') return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 })

  const { data, error } = await supabase
    .from('tenants')
    .select('id, store_name, slug, current_plan, plan_status, plan_expires_at, created_at')
    .order('created_at', { ascending: false })

  if (error) throw new DatabaseError(error.message)
  return NextResponse.json(data)
}
