import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function processOrderAction(payload: {
  tenantId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: any[];
  total: number;
}) {
  const supabase = createClient();

  // 1. إنشاء الطلب الأساسي (The Master Order)
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      tenant_id: payload.tenantId,
      customer_name: payload.customerName,
      customer_phone: payload.customerPhone,
      shipping_address: payload.address,
      total: payload.total,
      status: 'pending'
    })
    .select('id')
    .single();

  if (orderError) return { error: orderError.message };

  // 2. حقن تفاصيل المنتجات (Order Items Injection)
  const orderItems = payload.items.map(item => ({
    order_id: order.id,
    product_id: item.id,
    quantity: item.quantity,
    unit_price: item.price
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) return { error: itemsError.message };

  // 3. تحديث المخزون (Inventory Sync)
  // سيتم عبر تريجر SQL لضمان الدقة الذرية (Atomicity)
  
  revalidatePath('/merchant/orders');
  return { success: true, orderId: order.id };
}
