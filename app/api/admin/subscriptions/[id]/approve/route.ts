import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { plan, months } = await req.json()
  
  const expiry = new Date()
  expiry.setMonth(expiry.getMonth() + months)

  const { data: request } = await supabase.from('subscription_requests').update({ status: 'APPROVED' }).eq('id', params.id).select().single()

  await supabase.from('tenants').update({
    current_plan: plan,
    plan_status: 'active',
    plan_expires_at: expiry.toISOString()
  }).eq('id', request.tenant_id)

  return NextResponse.json({ success: true })
}
