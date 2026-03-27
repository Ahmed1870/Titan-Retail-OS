import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getAvailableOrdersAction() {
  const supabase = createClient();
  // جلب الطلبات التي تنتظر مندوب
  const { data, error } = await supabase
    .from('orders')
    .select('*, tenants(store_name, phone, address)')
    .eq('status', 'confirmed') // أو pending حسب سياسة النظام
    .order('created_at', { ascending: false });

  if (error) return { error: error.message };
  return { data };
}

export async function acceptOrderAction(orderId: string) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: 'UNAUTHORIZED' };

  // استدعاء المفاعل النووي للتعيين
  const { data, error } = await supabase.rpc('accept_delivery', {
    p_order_id: orderId,
    p_courier_id: session.user.id,
    p_courier_fee: 15.00 // قيمة افتراضية يمكن جعلها ديناميكية لاحقاً
  });

  if (error) return { error: error.message };

  revalidatePath('/courier');
  return { success: true, data };
}

export async function updateDeliveryStatusAction(orderId: string, status: 'picked_up' | 'delivered' | 'failed') {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: 'UNAUTHORIZED' };

  // تحديث حالة التوصيل وحالة الطلب في نفس الوقت
  const orderStatusMap = {
    picked_up: 'assigned',
    delivered: 'delivered',
    failed: 'failed'
  } as const;

  const { error } = await supabase
    .from('deliveries')
    .update({ 
      status: status === 'picked_up' ? 'picked_up' : (status === 'delivered' ? 'delivered' : 'failed'),
      delivered_at: status === 'delivered' ? new NOW() : null 
    })
    .eq('order_id', orderId)
    .eq('courier_id', session.user.id);

  if (error) return { error: error.message };

  await supabase
    .from('orders')
    .update({ status: orderStatusMap[status] })
    .eq('id', orderId);

  revalidatePath('/courier');
  return { success: true };
}
