import { createClient } from '@/lib/supabase/server';

export async function processCheckoutAction(
  tenantId: string, 
  customerInfo: { name: string; phone: string; address: string }, 
  cartItems: { id: string; quantity: number; price: number }[]
) {
  const supabase = createClient();

  // 1. حساب الإجمالي برمجياً (Server-side validation) لمنع تلاعب العميل
  const orderTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // 2. إنشاء الطلب الأساسي
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      tenant_id: tenantId,
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      shipping_address: customerInfo.address,
      total: orderTotal,
      status: 'pending' // سيتم التقاطه بواسطة تريجر المناديب لاحقاً
    })
    .select('id')
    .single();

  if (orderError || !order) return { error: orderError?.message || 'Failed to create order' };

  // 3. إدراج تفاصيل المنتجات (Order Items)
  const itemsToInsert = cartItems.map(item => ({
    order_id: order.id,
    product_id: item.id,
    quantity: item.quantity,
    unit_price: item.price
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsToInsert);

  if (itemsError) return { error: itemsError.message };

  return { success: true, orderId: order.id };
}
