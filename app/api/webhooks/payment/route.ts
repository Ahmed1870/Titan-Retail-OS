import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createClient()
  const body = await req.json()

  if (body.status === 'success') {
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance, total_earned')
      .eq('tenant_id', body.tenant_id)
      .single()

    await supabase.from('wallets').update({
      balance: (wallet?.balance || 0) + body.amount,
      total_earned: (wallet?.total_earned || 0) + body.amount
    }).eq('tenant_id', body.tenant_id)

    await supabase.from('transactions').insert({
      tenant_id: body.tenant_id,
      type: 'revenue',
      amount: body.amount,
      description: 'System Credit Refill',
      reference_id: body.reference
    })
  }

  return NextResponse.json({ received: true })
}
