import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createServerClient()
  try {
    const { email, password, full_name, store_name, phone, referral_code } = await req.json()

    // 1. Auth Signup
    const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password })
    if (authErr) throw authErr

    // 2. Create Tenant
    const slug = store_name.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substring(2, 5)
    const { data: tenant, error: tErr } = await supabase.from('tenants').insert({
      store_name, slug, owner_id: authData.user?.id, phone, current_plan: 'starter'
    }).select().single()
    if (tErr) throw tErr

    // 3. Referral Logic (The Merchant Link)
    if (referral_code) {
      const { data: referrer } = await supabase.from('tenants').select('id').eq('referral_code', referral_code).single()
      if (referrer) {
        await supabase.from('referrals').insert({
          referrer_tenant_id: referrer.id,
          referred_tenant_id: tenant.id,
          status: 'pending'
        })
        // Update tenant's referred_by for direct access
        await supabase.from('tenants').update({ referred_by: referrer.id }).eq('id', tenant.id)
      }
    }

    // 4. Create Public User Profile
    await supabase.from('users').insert({
      id: authData.user?.id,
      tenant_id: tenant.id,
      full_name,
      email,
      role: 'merchant'
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
