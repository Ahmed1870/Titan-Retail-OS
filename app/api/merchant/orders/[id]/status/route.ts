import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { DatabaseError } from '@/lib/errors'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { status } = await req.json()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: order, error: updateError } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select('tenant_id, customer_id, total')
    .single()

  if (updateError) throw new DatabaseError(updateError.message)

  // Trigger Notification (Schema Section 11)
  await supabase.from('notifications').insert({
    tenant_id: order.tenant_id,
    user_id: order.customer_id,
    title: "Order Update",
    message: `Your order status has been changed to ${status}`,
    type: 'order_status'
  })

  return NextResponse.json({ success: true, newStatus: status })
}
