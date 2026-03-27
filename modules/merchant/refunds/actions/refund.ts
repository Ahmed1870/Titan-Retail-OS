import { createClient } from '@/lib/supabase/server';

export async function processRefund(orderId: string, amount: number, reason: string) {
  const supabase = createClient();
  const { data: order } = await supabase.from('orders').select('tenant_id').eq('id', orderId).single();
  
  // تسجيل المرتجع
  const { error } = await supabase.from('refunds').insert({
    order_id: orderId,
    tenant_id: order.tenant_id,
    amount,
    reason
  });

  // خصم المبلغ من "محفظة المبيعات" وإضافته كـ Transaction مرتجع
  await supabase.from('transactions').insert({
    tenant_id: order.tenant_id,
    amount: -amount,
    type: 'refund',
    description: `Refund for Order #${orderId.substring(0,6)}`
  });
  
  return { success: !error };
}
