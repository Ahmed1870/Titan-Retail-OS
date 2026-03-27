import { verifyCourier } from './auth';
import { orderService } from '@/services/orderService';

export async function getCourierDeliveriesAction() {
  const { supabase, user } = await verifyCourier();
  const { data } = await supabase.from('deliveries')
    .select('*, orders(id, total, shipping_address, status, order_items(quantity, products(name, images)))')
    .eq('courier_id', user.id)
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function updateDeliveryStatusAction(id: string, status: string, notes?: string) {
  const { supabase, user } = await verifyCourier();
  const allowed = ['picked_up', 'in_transit', 'delivered', 'failed'];
  if (!allowed.includes(status)) throw new Error('Invalid status');

  const updateData: any = { status, notes: notes ?? null };
  if (status === 'delivered') updateData.delivered_at = new Date().toISOString();
  if (status === 'picked_up') updateData.pickup_at = new Date().toISOString();

  const { error } = await supabase.from('deliveries')
    .update(updateData)
    .eq('id', id)
    .eq('courier_id', user.id);

  if (error) throw new Error(error.message);

  if (status === 'delivered') {
    const { data: del } = await supabase.from('deliveries').select('order_id').eq('id', id).single();
    if (del) await orderService.updateStatus(del.order_id, 'delivered', user.id);
  }
  
  return { success: true };
}
