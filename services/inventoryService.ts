import { createClient } from '@/lib/supabase/server'

export const inventoryService = {
  async updateStock(tenantId: string, productId: string, delta: number, reason: string) {
    const supabase = createClient()
    
    const { data: current } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('product_id', productId)
      .eq('tenant_id', tenantId)
      .single()

    const newQty = (current?.quantity || 0) + delta

    const { error: uErr } = await supabase.from('inventory').update({
      quantity: newQty,
      updated_at: new Date().toISOString()
    }).eq('product_id', productId).eq('tenant_id', tenantId)

    if (!uErr) {
      await supabase.from('inventory_logs').insert({
        tenant_id: tenantId,
        product_id: productId,
        delta,
        previous_qty: current?.quantity || 0,
        new_qty: newQty,
        reason
      })
    }
    return { success: !uErr, newQty }
  }
}
