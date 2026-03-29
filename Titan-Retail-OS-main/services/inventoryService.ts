import { supabase } from '@/lib/supabase/server'

export const InventoryService = {
  async adjustStock(productId: string, delta: number, reason: string, tenantId: string, userId: string) {
    // 1. جلب الكمية الحالية
    const { data: current } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('product_id', productId)
      .eq('tenant_id', tenantId)
      .single();

    const newQty = (current?.quantity || 0) + delta;

    // 2. تحديث المخزون وتسجيل اللوج (Log) في عملية واحدة
    const { error } = await supabase.rpc('update_stock_with_log', {
      p_product_id: productId,
      p_tenant_id: tenantId,
      p_delta: delta,
      p_new_qty: newQty,
      p_reason: reason,
      p_user_id: userId
    });

    return { success: !error, error };
  }
}
