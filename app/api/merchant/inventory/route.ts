import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createClient()
  const body = await req.json()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: prof } = await supabase.from('users').select('tenant_id').eq('id', user?.id).single()

  const { data, error } = await supabase.from('inventory').upsert({
    ...body,
    tenant_id: prof?.tenant_id,
    updated_at: new Date().toISOString()
  })

  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ success: true })
}
