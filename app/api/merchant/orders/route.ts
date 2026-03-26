import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: prof } = await supabase.from('users').select('tenant_id').eq('id', user?.id).single()

  const { data, error } = await supabase
    .from('orders')
    .select('*, customers(full_name, phone)')
    .eq('tenant_id', prof?.tenant_id)
    .order('created_at', { ascending: false })

  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data)
}
