import { supabase } from '@/lib/supabase/server'

export const OrderService = {
  async createOrderWithTransaction(orderData: any, amount: number, tenantId: string) {
    // استخدام RPC أو Transaction لضمان كتابة الجدولين مع بعض
    const { data, error } = await supabase.rpc('create_order_and_transaction', {
      p_tenant_id: tenantId,
      p_amount: amount,
      p_order_details: orderData
    });
    return { data, error };
  }
}
