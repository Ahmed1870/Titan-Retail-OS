import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: prof } = await supabase.from('users').select('tenant_id').eq('id', user?.id).single()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('tenant_id', prof?.tenant_id)

  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = createClient()
  const { name, slug } = await req.json()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: prof } = await supabase.from('users').select('tenant_id').eq('id', user?.id).single()

  const { data, error } = await supabase.from('categories').insert({
    name, slug, tenant_id: prof?.tenant_id
  }).select().single()

  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data)
}
