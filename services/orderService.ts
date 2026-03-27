// services/orderService.ts
import { createServiceClient } from '@/lib/supabase/server';
import { ServiceError } from '@/services/errors';
import type { Order, OrderStatus, PaginatedResponse } from '@/types';

export const orderService = {
  /**
   * Atomic order creation via PostgreSQL RPC.
   * Handles: validation, stock reservation, items, inventory_logs,
   * transaction, invoice, notification — all in one transaction.
   */
  async createOrder(payload: {
    tenantId: string;
    customerId: string;
    items: Array<{ product_id: string; quantity: number; unit_price: number; discount?: number }>;
    shippingAddress: Record<string, unknown>;
    deliveryFee?: number;
    couponCode?: string;
    notes?: string;
    idempotencyKey?: string;
  }) {
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

  async updateStatus(
    orderId: string,
    newStatus: OrderStatus,
    performedBy: string,
    reason?: string
  ) {
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

  async getById(orderId: string, tenantId: string): Promise<Order> {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*, products(name, sku, images)),
        users!customer_id(full_name, phone, email),
        deliveries(*)
      `)
      .eq('id', orderId)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .single();

    if (error || !data) throw new ServiceError('ORDER_NOT_FOUND', 'Order not found');
    return data as Order;
  },

  async list(
    tenantId: string,
    filters: {
      status?: OrderStatus;
      customerId?: string;
      courierId?: string;
      search?: string;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<Order>> {
    const supabase = createServiceClient();
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);

    let query = supabase
      .from('orders')
      .select(
        `*, order_items(*, products(name, images)),
         users!customer_id(full_name, phone),
         deliveries(status, courier_id)`,
        { count: 'exact' }
      )
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.customerId) query = query.eq('customer_id', filters.customerId);
    if (filters.courierId) query = query.eq('assigned_courier_id', filters.courierId);
    if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
    if (filters.dateTo) query = query.lte('created_at', filters.dateTo);

    const { data, error, count } = await query;
    if (error) throw new ServiceError('ORDER_LIST_FAILED', error.message);
    return { data: (data ?? []) as Order[], total: count ?? 0, page, limit };
  },

  async assignCourier(orderId: string, courierId: string, performedBy: string) {
    const supabase = createServiceClient();

    const { error: assignError } = await supabase
      .from('orders')
      .update({ assigned_courier_id: courierId })
      .eq('id', orderId);

    if (assignError) throw new ServiceError('COURIER_ASSIGN_FAILED', assignError.message);

    await supabase
      .from('deliveries')
      .update({ courier_id: courierId })
      .eq('order_id', orderId);

    return this.updateStatus(orderId, 'assigned', performedBy);
  },

  async softDelete(orderId: string, tenantId: string, performedBy: string) {
    const supabase = createServiceClient();
    await this.updateStatus(orderId, 'cancelled', performedBy, 'Deleted by merchant');
    await supabase
      .from('orders')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', orderId)
      .eq('tenant_id', tenantId);
  },
};
