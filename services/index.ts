// services/subscriptionService.ts
import { createServiceClient } from '@/lib/supabase/server';
import { ServiceError } from '@/services/errors';
import type { SubscriptionRequest, PlanType, PaymentMethod } from '@/types';

export const PLAN_PRICES: Record<PlanType, number> = {
  starter: 299,
  pro: 599,
  enterprise: 1299,
};

export const subscriptionService = {
  async createRequest(payload: {
    tenantId: string;
    requestedBy: string;
    plan: PlanType;
    paymentMethod: PaymentMethod;
    fullName: string;
    phoneNumber: string;
  }): Promise<SubscriptionRequest & { whatsappLink: string }> {
    const supabase = createServiceClient();
    const idempotencyKey = `subreq_${payload.tenantId}_${Date.now()}`;

    const { data: existing } = await supabase
      .from('subscription_requests')
      .select('id')
      .eq('tenant_id', payload.tenantId)
      .eq('status', 'PENDING')
      .single();

    if (existing) throw new ServiceError('DUPLICATE_REQUEST', 'A pending subscription request already exists');

    const { data: tenant } = await supabase
      .from('tenants')
      .select('store_name')
      .eq('id', payload.tenantId)
      .single();

    const methodLabel = payload.paymentMethod.replace(/_/g, ' ');
    const waText = encodeURIComponent(
      `Hello Admin, I am ${tenant?.store_name ?? 'Merchant'}, I want to activate the ${payload.plan} plan using ${methodLabel}. My ID is: ${payload.tenantId}`
    );
    const whatsappLink = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${waText}`;

    const { data, error } = await supabase
      .from('subscription_requests')
      .insert({
        tenant_id: payload.tenantId,
        requested_by: payload.requestedBy,
        plan: payload.plan,
        payment_method: payload.paymentMethod,
        full_name: payload.fullName,
        phone_number: payload.phoneNumber,
        status: 'PENDING',
        whatsapp_link: whatsappLink,
        idempotency_key: idempotencyKey,
      })
      .select()
      .single();

    if (error) throw new ServiceError('SUB_REQUEST_FAILED', error.message);
    return { ...(data as SubscriptionRequest), whatsappLink };
  },

  async approveRequest(requestId: string, adminId: string) {
    const supabase = createServiceClient();
    const { data, error } = await supabase.rpc('approve_subscription', {
      p_request_id: requestId,
      p_admin_id: adminId,
    });
    if (error) throw new ServiceError('APPROVAL_FAILED', error.message);
    return data;
  },

  async rejectRequest(requestId: string, adminId: string, reason: string) {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('subscription_requests')
      .update({
        status: 'REJECTED',
        rejected_reason: reason,
        approved_by: adminId,
        approved_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) throw new ServiceError('REJECTION_FAILED', error.message);

    // Notify merchant
    const { data: req } = await supabase
      .from('subscription_requests')
      .select('tenant_id, tenants(owner_id, store_name)')
      .eq('id', requestId)
      .single();

    if (req?.tenants) {
      await supabase.from('notifications').insert({
        tenant_id: req.tenant_id,
        user_id: (req.tenants as any).owner_id,
        type: 'subscription',
        title: 'Subscription Request Rejected',
        body: `Your ${req?.tenants ? (req.tenants as any).store_name : ''} subscription request was rejected. Reason: ${reason}`,
        data: { reason },
      });
    }
  },

  async getPendingRequests(): Promise<SubscriptionRequest[]> {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('subscription_requests')
      .select('*, tenants(store_name, logo_url)')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true });

    if (error) throw new ServiceError('PENDING_REQUESTS_FAILED', error.message);
    return (data ?? []) as SubscriptionRequest[];
  },

  async checkAutoActivation(): Promise<boolean> {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'auto_activation')
      .single();
    return data?.value?.enabled === true;
  },

  async getCurrentSubscription(tenantId: string) {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    return data;
  },
};

// ============================================================
// services/referralService.ts
// ============================================================
export const referralService = {
  async applyReferralCode(newTenantId: string, referralCode: string) {
    const supabase = createServiceClient();

    const { data: referrer } = await supabase
      .from('tenants')
      .select('id')
      .eq('referral_code', referralCode.trim().toUpperCase())
      .single();

    if (!referrer) throw new ServiceError('INVALID_REFERRAL_CODE', 'Referral code not found');
    if (referrer.id === newTenantId) throw new ServiceError('SELF_REFERRAL', 'Cannot use your own referral code');

    const { error } = await supabase.from('referrals').insert({
      referrer_tenant_id: referrer.id,
      referred_tenant_id: newTenantId,
      status: 'pending',
    });

    if (error?.code === '23505') return; // Already exists — idempotent
    if (error) throw new ServiceError('REFERRAL_CREATE_FAILED', error.message);

    await supabase
      .from('tenants')
      .update({ referred_by: referrer.id })
      .eq('id', newTenantId);
  },

  async getStats(tenantId: string) {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from('referrals')
      .select('status, referred_tenant_id, tenants!referred_tenant_id(store_name, plan_status)')
      .eq('referrer_tenant_id', tenantId);

    const refs = data ?? [];
    return {
      total: refs.length,
      completed: refs.filter(r => r.status === 'completed').length,
      pending: refs.filter(r => r.status === 'pending').length,
      rewarded: refs.filter(r => r.status === 'rewarded').length,
      referrals: refs,
    };
  },

  async getReferralCode(tenantId: string): Promise<string> {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from('tenants')
      .select('referral_code')
      .eq('id', tenantId)
      .single();
    return data?.referral_code ?? '';
  },
};

// ============================================================
// services/paymentService.ts
// ============================================================
export const paymentService = {
  async handleWebhook(payload: {
    tenantId: string;
    plan: PlanType;
    amount: number;
    reference: string;
    idempotencyKey: string;
  }) {
    const supabase = createServiceClient();

    const { data: existing } = await supabase
      .from('idempotency_keys')
      .select('resource_id')
      .eq('key', payload.idempotencyKey)
      .single();

    if (existing) return { alreadyProcessed: true, subId: existing.resource_id };

    const autoMode = await subscriptionService.checkAutoActivation();
    if (!autoMode) throw new ServiceError('AUTO_MODE_DISABLED', 'Auto-activation is disabled');

    await supabase.from('job_queue').insert({
      job_type: 'auto_approve_subscription',
      payload: {
        tenantId: payload.tenantId,
        plan: payload.plan,
        amount: payload.amount,
        reference: payload.reference,
        idempotencyKey: payload.idempotencyKey,
      },
    });

    return { queued: true };
  },

  async getWallet(tenantId: string) {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();
    if (error) throw new ServiceError('WALLET_FETCH_FAILED', error.message);
    return data;
  },

  async getTransactions(
    tenantId: string,
    filters: { type?: string; page?: number; limit?: number }
  ) {
    const supabase = createServiceClient();
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);

    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (filters.type) query = query.eq('type', filters.type);

    const { data, error, count } = await query;
    if (error) throw new ServiceError('TRANSACTIONS_FETCH_FAILED', error.message);
    return { data: data ?? [], total: count ?? 0, page, limit };
  },
};

// ============================================================
// services/reportService.ts
// ============================================================
export const reportService = {
  async getDashboardStats(tenantId: string) {
    const supabase = createServiceClient();
    const cacheKey = `dashboard_${tenantId}`;

    const { data: cached } = await supabase
      .from('cache_entries')
      .select('value')
      .eq('key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cached) return cached.value;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [
      { data: revenueData },
      { data: ordersData },
      { data: allInventory },
      { count: totalProducts },
    ] = await Promise.all([
      supabase
        .from('transactions')
        .select('amount')
        .eq('tenant_id', tenantId)
        .eq('type', 'revenue')
        .gte('created_at', thirtyDaysAgo),
      supabase
        .from('orders')
        .select('status')
        .eq('tenant_id', tenantId)
        .is('deleted_at', null),
      supabase
        .from('inventory')
        .select('quantity, low_stock_threshold')
        .eq('tenant_id', tenantId),
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .is('deleted_at', null),
    ]);

    const stats = {
      revenue_30d: (revenueData ?? []).reduce((s, t) => s + t.amount, 0),
      orders_by_status: (ordersData ?? []).reduce(
        (acc: Record<string, number>, o) => ({ ...acc, [o.status]: (acc[o.status] ?? 0) + 1 }),
        {}
      ),
      low_stock_count: (allInventory ?? []).filter(i => i.quantity <= i.low_stock_threshold).length,
      total_products: totalProducts ?? 0,
    };

    await supabase.from('cache_entries').upsert({
      key: cacheKey,
      tenant_id: tenantId,
      value: stats,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });

    return stats;
  },

  async getRevenueChart(tenantId: string, days: number = 30) {
    const supabase = createServiceClient();
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('transactions')
      .select('amount, created_at, type')
      .eq('tenant_id', tenantId)
      .in('type', ['revenue', 'refund'])
      .gte('created_at', from)
      .order('created_at', { ascending: true });

    if (error) throw new ServiceError('CHART_FETCH_FAILED', error.message);

    const grouped = (data ?? []).reduce((acc: Record<string, { revenue: number; refund: number }>, t) => {
      const date = t.created_at.split('T')[0];
      if (!acc[date]) acc[date] = { revenue: 0, refund: 0 };
      (acc[date] as any)[t.type] += t.amount;
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, vals]) => ({ date, ...vals }));
  },

  async getTopProducts(tenantId: string, limit: number = 10) {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('order_items')
      .select('product_id, quantity, line_total, products(name, sku)')
      .eq('tenant_id', tenantId)
      .order('quantity', { ascending: false })
      .limit(limit * 5); // over-fetch then aggregate

    if (error) throw new ServiceError('TOP_PRODUCTS_FAILED', error.message);

    const aggregated = (data ?? []).reduce((acc: Record<string, any>, item) => {
      const pid = item.product_id;
      if (!acc[pid]) acc[pid] = { product_id: pid, product: item.products, total_qty: 0, total_revenue: 0 };
      acc[pid].total_qty += item.quantity;
      acc[pid].total_revenue += item.line_total;
      return acc;
    }, {});

    return Object.values(aggregated)
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, limit);
  },

  async getAdminOverview() {
    const supabase = createServiceClient();
    const [
      { count: totalTenants },
      { count: activeTenants },
      { count: pendingRequests },
      { data: revenueData },
      { count: totalOrders },
    ] = await Promise.all([
      supabase.from('tenants').select('id', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('tenants').select('id', { count: 'exact', head: true }).eq('plan_status', 'active'),
      supabase.from('subscription_requests').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
      supabase.from('transactions').select('amount').eq('type', 'platform_fee').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('orders').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    ]);

    return {
      total_tenants: totalTenants ?? 0,
      active_tenants: activeTenants ?? 0,
      pending_requests: pendingRequests ?? 0,
      platform_fee_30d: (revenueData ?? []).reduce((s, t) => s + t.amount, 0),
      total_orders: totalOrders ?? 0,
    };
  },
};

// ============================================================
// services/auditService.ts
// ============================================================
export const auditService = {
  async log(payload: {
    tenantId?: string;
    performedBy: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'LOGIN' | 'LOGOUT';
    resourceType: string;
    resourceId?: string;
    beforeState?: Record<string, unknown>;
    afterState?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const supabase = createServiceClient();
    await supabase.from('audit_logs').insert({
      tenant_id: payload.tenantId ?? null,
      performed_by: payload.performedBy,
      action: payload.action,
      resource_type: payload.resourceType,
      resource_id: payload.resourceId ?? null,
      before_state: payload.beforeState ?? null,
      after_state: payload.afterState ?? null,
      ip_address: payload.ipAddress ?? null,
      user_agent: payload.userAgent ?? null,
    });
  },

  async getLogs(filters: { tenantId?: string; resourceType?: string; page?: number; limit?: number }) {
    const supabase = createServiceClient();
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 50, 200);

    let query = supabase
      .from('audit_logs')
      .select('*, users!performed_by(full_name, role)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (filters.tenantId) query = query.eq('tenant_id', filters.tenantId);
    if (filters.resourceType) query = query.eq('resource_type', filters.resourceType);

    const { data, error, count } = await query;
    if (error) throw new ServiceError('AUDIT_FETCH_FAILED', error.message);
    return { data: data ?? [], total: count ?? 0, page, limit };
  },
};

// ============================================================
// services/notificationService.ts
// ============================================================
export const notificationService = {
  async send(payload: {
    tenantId?: string;
    userId: string;
    type: 'order' | 'subscription' | 'referral' | 'achievement' | 'alert' | 'system';
    title: string;
    body?: string;
    data?: Record<string, unknown>;
  }) {
    const supabase = createServiceClient();
    await supabase.from('notifications').insert({
      tenant_id: payload.tenantId ?? null,
      user_id: payload.userId,
      type: payload.type,
      title: payload.title,
      body: payload.body ?? null,
      data: payload.data ?? {},
    });
  },

  async markRead(notificationId: string, userId: string) {
    const supabase = createServiceClient();
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId);
  },

  async markAllRead(userId: string) {
    const supabase = createServiceClient();
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false);
  },

  async getUnread(userId: string) {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(50);
    return data ?? [];
  },

  async getAll(userId: string, page: number = 1) {
    const supabase = createServiceClient();
    const limit = 20;
    const { data, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    return { data: data ?? [], total: count ?? 0 };
  },
};

// ============================================================
// services/productService.ts
// ============================================================
export const productService = {
  async list(tenantId: string, filters: { category?: string; search?: string; active?: boolean; page?: number; limit?: number }) {
    const supabase = createServiceClient();
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);

    let query = supabase
      .from('products')
      .select('*, inventory(quantity, reserved_quantity, low_stock_threshold)', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (filters.category) query = query.eq('category', filters.category);
    if (filters.active !== undefined) query = query.eq('is_active', filters.active);
    if (filters.search) query = query.ilike('name', `%${filters.search}%`);

    const { data, error, count } = await query;
    if (error) throw new ServiceError('PRODUCT_LIST_FAILED', error.message);
    return { data: data ?? [], total: count ?? 0, page, limit };
  },

  async create(tenantId: string, userId: string, payload: {
    sku: string; name: string; description?: string; category?: string;
    price: number; cost_price?: number; tax_rate?: number;
    images?: string[]; initial_stock?: number;
  }) {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('products')
      .insert({ ...payload, tenant_id: tenantId })
      .select()
      .single();

    if (error) throw new ServiceError('PRODUCT_CREATE_FAILED', error.message);

    await supabase.from('inventory').insert({
      tenant_id: tenantId,
      product_id: data.id,
      quantity: payload.initial_stock ?? 0,
    });

    await auditService.log({ tenantId, performedBy: userId, action: 'CREATE', resourceType: 'product', resourceId: data.id });
    return data;
  },

  async update(tenantId: string, productId: string, userId: string, updates: Partial<{
    name: string; description: string; price: number; cost_price: number;
    category: string; is_active: boolean; is_featured: boolean; images: string[];
  }>) {
    const supabase = createServiceClient();
    const { data: before } = await supabase.from('products').select('*').eq('id', productId).single();
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) throw new ServiceError('PRODUCT_UPDATE_FAILED', error.message);
    await auditService.log({ tenantId, performedBy: userId, action: 'UPDATE', resourceType: 'product', resourceId: productId, beforeState: before, afterState: data });
    return data;
  },

  async softDelete(tenantId: string, productId: string, userId: string) {
    const supabase = createServiceClient();
    await supabase
      .from('products')
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq('id', productId)
      .eq('tenant_id', tenantId);
    await auditService.log({ tenantId, performedBy: userId, action: 'DELETE', resourceType: 'product', resourceId: productId });
  },
};
