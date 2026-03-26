import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createClient()
  const { email, password, full_name, store_name, slug } = await req.json()

  const { data: auth, error: aErr } = await supabase.auth.signUp({ email, password })
  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 400 })

  const { data: tenant, error: tErr } = await supabase.from('tenants').insert({
    store_name,
    slug,
    owner_id: auth.user?.id,
    plan_status: 'inactive'
  }).select().single()

  if (tErr) return NextResponse.json({ error: tErr.message }, { status: 400 })

  await Promise.all([
    supabase.from('users').insert({
      id: auth.user?.id,
      tenant_id: tenant.id,
      role: 'merchant',
      full_name,
      email
    }),
    supabase.from('wallets').insert({
      tenant_id: tenant.id,
      balance: 0
    })
  ])

  return NextResponse.json({ success: true, tenant_id: tenant.id })
}
