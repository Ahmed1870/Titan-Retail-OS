import { createClient } from '@/lib/supabase/server'
import { OrderStatus } from '@/lib/types'

export const orderService = {
  async createOrder(tenantId: string, customerId: string, items: any[], totals: { subtotal: number; tax: number; total: number }) {
    const supabase = createClient()
    
    const { data: order, error: oErr } = await supabase.from('orders').insert({
      tenant_id: tenantId,
      customer_id: customerId,
      subtotal: totals.subtotal,
      tax_amount: totals.tax,
      total: totals.total,
      status: 'pending' as OrderStatus
    }).select().single()

    if (oErr) throw oErr

    const orderItems = items.map(item => ({
      tenant_id: tenantId,
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
      line_total: item.price * item.quantity
    }))

    const { error: iErr } = await supabase.from('order_items').insert(orderItems)
    if (iErr) throw iErr

    return order
  }
}
