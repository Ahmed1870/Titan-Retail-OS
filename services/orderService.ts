import { createServiceClient } from '@/lib/supabase/server';
import { ServiceError } from '@/services/errors';
import type { Order, OrderStatus, PaginatedResponse } from '@/types';

export const orderService = {
  async createOrder(payload: any) {
    const supabase = createServiceClient();
    const { data, error } = await supabase.rpc('create_order', {
      p_tenant_id: payload.tenantId,
      p_customer_id: payload.customerId,
      p_items: payload.items,
      p_shipping_address: payload.shippingAddress,
      p_delivery_fee: payload.deliveryFee ?? 0,
      p_coupon_code: payload.couponCode ?? null,
      p_notes: payload.notes ?? null,
      p_idempotency_key: payload.idempotencyKey ?? crypto.randomUUID(),
    });
    if (error) throw new ServiceError('ORDER_CREATE_FAILED', error.message);
    return data;
  },

  async updateStatus(orderId: string, newStatus: string, performedBy: string, reason?: string) {
    const supabase = createServiceClient();
    const { data, error } = await supabase.rpc('update_order_status', {
      p_order_id: orderId,
      p_new_status: newStatus,
      p_performed_by: performedBy,
      p_reason: reason ?? null,
    });
    if (error) throw new ServiceError('ORDER_STATUS_UPDATE_FAILED', error.message);
    return data;
  },

  async assignCourier(orderId: string, courierId: string, performedBy: string) {
    const supabase = createServiceClient();
    const { error: err1 } = await supabase.from('orders').update({ assigned_courier_id: courierId }).eq('id', orderId);
    const { error: err2 } = await supabase.from('deliveries').update({ courier_id: courierId }).eq('order_id', orderId);
    
    if (err1 || err2) throw new ServiceError('COURIER_ASSIGN_FAILED', 'Failed to sync courier assignment');
    return this.updateStatus(orderId, 'assigned', performedBy);
  },

  async list(tenantId: string, filters: any): Promise<PaginatedResponse<Order>> {
    const supabase = createServiceClient();
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);

    let query = supabase
      .from('orders')
      .select(`*, order_items(*, products(name, images)), users!customer_id(full_name, phone), deliveries(status, courier_id)`, { count: 'exact' })
      .eq('tenant_id', tenantId)
      .is('deleted_at', null);

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.search) query = query.or(`id.ilike.%${filters.search}%, notes.ilike.%${filters.search}%`);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new ServiceError('ORDER_LIST_FAILED', error.message);
    return { data: (data ?? []) as Order[], total: count ?? 0, page, limit };
  }
};
