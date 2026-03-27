import { createClient } from '@/lib/supabase/server';

export async function processFastSale(payload: {
  tenantId: string,
  items: any[],
  total: number,
  paymentMethod: 'cash' | 'card'
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. جلب الوردية المفتوحة حالياً لهذا الموظف
  const { data: activeShift } = await supabase
    .from('shifts')
    .select('id')
    .eq('user_id', user?.id)
    .eq('status', 'open')
    .single();

  if (!activeShift) return { error: 'No active shift found. Please open a shift first.' };

  // 2. إنشاء الطلب فوراً (Direct Order Injection)
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      tenant_id: payload.tenantId,
      shift_id: activeShift.id,
      total: payload.total,
      status: 'delivered', // البيع المباشر يعتبر مستلم فوراً
      payment_method: payload.paymentMethod
    })
    .select()
    .single();

  if (orderError) return { error: orderError.message };

  // 3. تحديث مبالغ الوردية (Shift Balance Sync)
  if (payload.paymentMethod === 'cash') {
    await supabase.rpc('increment_shift_cash', { 
      shift_row_id: activeShift.id, 
      amount_to_add: payload.total 
    });
  }

  return { success: true, orderId: order.id };
}
