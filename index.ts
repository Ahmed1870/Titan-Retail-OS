// ============================================================
// TITAN-RETAIL OS — SERVICE LAYER
// All business logic lives here. No direct DB in routes.
// ============================================================

// lib/supabase/server.ts
// (Use this pattern in every service)
// import { createClient } from '@supabase/supabase-js'
// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// ============================================================
// services/orderService.ts
// ============================================================
export const orderService = {
  /**
   * Create order via atomic RPC — single transaction
   * Handles: stock validation, reservation, items, invoice, notifications
   */
  async createOrder(payload: {
    tenantId: string
    customerId: string
    items: Array<{ product_id: string; quantity: number; unit_price: number; discount?: number }>
    shippingAddress: Record<string, unknown>
    deliveryFee?: number
    couponCode?: string
    notes?: string
    idempotencyKey?: string
  }) {
    const { data, error } = await supabase.rpc('create_order', {
      p_tenant_id: payload.tenantId,
      p_customer_id: payload.customerId,
      p_items: payload.items,
      p_shipping_address: payload.shippingAddress,
      p_delivery_fee: payload.deliveryFee ?? 0,
      p_coupon_code: payload.couponCode ?? null,
      p_notes: payload.notes ?? null,
      p_idempotency_key: payload.idempotencyKey ?? crypto.randomUUID(),
    })
    if (error) throw new ServiceError('ORDER_CREATE_FAILED', error.message)
    return data
  },

  async updateStatus(orderId: string, newStatus: OrderStatus, performedBy: string, reason?: string) {
    const { data, error } = await supabase.rpc('update_order_status', {
      p_order_id: orderId,
      p_new_status: newStatus,
      p_performed_by: performedBy,
      p_reason: reason ?? null,
    })
    if (error) throw new ServiceError('ORDER_STATUS_UPDATE_FAILED', error.message)
    return data
  },

  async listOrders(tenantId: string, filters: {
    status?: OrderStatus
    customerId?: string
    courierId?: string
    page?: number
    limit?: number
  }) {
    let query = supabase
      .from('orders')
      .select(`
        *, 
        order_items(*, products(name, images)),
        users!customer_id(full_name, phone),
        deliveries(status, courier_id)
      `, { count: 'exact' })
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (filters.status) query = query.eq('status', filters.status)
    if (filters.customerId) query = query.eq('customer_id', filters.customerId)
    if (filters.courierId) query = query.eq('assigned_courier_id', filters.courierId)

    const page = filters.page ?? 1
    const limit = filters.limit ?? 20
    query = query.range((page - 1) * limit, page * limit - 1)

    const { data, error, count } = await query
    if (error) throw new ServiceError('ORDER_LIST_FAILED', error.message)
    return { data, total: count, page, limit }
  },

  async assignCourier(orderId: string, courierId: string, performedBy: string) {
    const { error: updateError } = await supabase
      .from('orders')
      .update({ assigned_courier_id: courierId })
      .eq('id', orderId)

    if (updateError) throw new ServiceError('COURIER_ASSIGN_FAILED', updateError.message)

    await supabase.from('deliveries').update({ courier_id: courierId }).eq('order_id', orderId)

    return orderService.updateStatus(orderId, 'assigned', performedBy)
  },
}

// ============================================================
// services/inventoryService.ts
// ============================================================
export const inventoryService = {
  async getStock(tenantId: string, productId?: string) {
    let query = supabase
      .from('inventory')
      .select('*, products(name, sku, images)')
      .eq('tenant_id', tenantId)

    if (productId) query = query.eq('product_id', productId)
    const { data, error } = await query
    if (error) throw new ServiceError('INVENTORY_FETCH_FAILED', error.message)
    return data
  },

  async getLowStockAlerts(tenantId: string) {
    const { data, error } = await supabase
      .from('inventory')
      .select('*, products(name, sku, images)')
      .eq('tenant_id', tenantId)
      .lte('quantity', supabase.raw('low_stock_threshold'))
    if (error) throw new ServiceError('LOW_STOCK_FETCH_FAILED', error.message)
    return data
  },

  async adjustStock(payload: {
    tenantId: string
    productId: string
    delta: number
    reason: string
    performedBy: string
  }) {
    // Read current
    const { data: inv, error: fetchErr } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('tenant_id', payload.tenantId)
      .eq('product_id', payload.productId)
      .single()

    if (fetchErr || !inv) throw new ServiceError('INVENTORY_NOT_FOUND', 'Inventory record not found')

    const newQty = inv.quantity + payload.delta
    if (newQty < 0) throw new ServiceError('INSUFFICIENT_STOCK', 'Stock cannot go negative')

    const { error: updateErr } = await supabase
      .from('inventory')
      .update({ quantity: newQty })
      .eq('tenant_id', payload.tenantId)
      .eq('product_id', payload.productId)

    if (updateErr) throw new ServiceError('INVENTORY_UPDATE_FAILED', updateErr.message)

    await supabase.from('inventory_logs').insert({
      tenant_id: payload.tenantId,
      product_id: payload.productId,
      delta: payload.delta,
      previous_qty: inv.quantity,
      new_qty: newQty,
      reason: payload.reason,
      performed_by: payload.performedBy,
    })

    return { previous: inv.quantity, new: newQty }
  },
}

// ============================================================
// services/subscriptionService.ts
// ============================================================
export const subscriptionService = {
  PLAN_PRICES: { starter: 299, pro: 599, enterprise: 1299 } as const,

  async createRequest(payload: {
    tenantId: string
    requestedBy: string
    plan: 'starter' | 'pro' | 'enterprise'
    paymentMethod: 'vodafone_cash' | 'instapay' | 'bank_transfer'
    fullName: string
    phoneNumber: string
  }) {
    const idempotencyKey = `subreq_${payload.tenantId}_${Date.now()}`

    // Check for pending request
    const { data: existing } = await supabase
      .from('subscription_requests')
      .select('id')
      .eq('tenant_id', payload.tenantId)
      .eq('status', 'PENDING')
      .single()

    if (existing) throw new ServiceError('DUPLICATE_REQUEST', 'A pending request already exists')

    // Get tenant store name
    const { data: tenant } = await supabase
      .from('tenants')
      .select('store_name')
      .eq('id', payload.tenantId)
      .single()

    // Generate WhatsApp link
    const waText = encodeURIComponent(
      `Hello Admin, I am ${tenant?.store_name}, I want to activate the ${payload.plan} plan using ${payload.paymentMethod.replace('_', ' ')}. My ID is: ${payload.tenantId}`
    )
    const whatsappLink = `https://wa.me/201019672878?text=${waText}`

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
      .single()

    if (error) throw new ServiceError('SUB_REQUEST_FAILED', error.message)
    return { ...data, whatsappLink }
  },

  async approveRequest(requestId: string, adminId: string) {
    const { data, error } = await supabase.rpc('approve_subscription', {
      p_request_id: requestId,
      p_admin_id: adminId,
    })
    if (error) throw new ServiceError('APPROVAL_FAILED', error.message)
    return data
  },

  async rejectRequest(requestId: string, adminId: string, reason: string) {
    const { error } = await supabase
      .from('subscription_requests')
      .update({ status: 'REJECTED', rejected_reason: reason, approved_by: adminId })
      .eq('id', requestId)

    if (error) throw new ServiceError('REJECTION_FAILED', error.message)

    await auditService.log({
      performedBy: adminId,
      action: 'REJECT',
      resourceType: 'subscription_request',
      resourceId: requestId,
      afterState: { reason },
    })
  },

  async getPendingRequests() {
    const { data, error } = await supabase
      .from('subscription_requests')
      .select('*, tenants(store_name, logo_url)')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true })

    if (error) throw new ServiceError('PENDING_REQUESTS_FETCH_FAILED', error.message)
    return data
  },

  async checkAutoActivation(): Promise<boolean> {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'auto_activation')
      .single()
    return data?.value?.enabled === true
  },
}

// ============================================================
// services/referralService.ts
// ============================================================
export const referralService = {
  async applyReferralCode(newTenantId: string, referralCode: string) {
    const { data: referrer } = await supabase
      .from('tenants')
      .select('id')
      .eq('referral_code', referralCode.toUpperCase())
      .single()

    if (!referrer) throw new ServiceError('INVALID_REFERRAL_CODE', 'Referral code not found')
    if (referrer.id === newTenantId) throw new ServiceError('SELF_REFERRAL', 'Cannot refer yourself')

    const { error } = await supabase.from('referrals').insert({
      referrer_tenant_id: referrer.id,
      referred_tenant_id: newTenantId,
      status: 'pending',
    })

    if (error?.code === '23505') return // Already exists, idempotent
    if (error) throw new ServiceError('REFERRAL_CREATE_FAILED', error.message)

    await supabase.from('tenants')
      .update({ referred_by: referrer.id })
      .eq('id', newTenantId)
  },

  async getReferralStats(tenantId: string) {
    const { data, error } = await supabase
      .from('referrals')
      .select('status, referred_tenant_id, tenants!referred_tenant_id(store_name)')
      .eq('referrer_tenant_id', tenantId)

    if (error) throw new ServiceError('REFERRAL_STATS_FAILED', error.message)

    return {
      total: data?.length ?? 0,
      completed: data?.filter(r => r.status === 'completed').length ?? 0,
      pending: data?.filter(r => r.status === 'pending').length ?? 0,
      referred: data,
    }
  },
}

// ============================================================
// services/paymentService.ts
// ============================================================
export const paymentService = {
  /**
   * Webhook handler for auto-activation mode
   * Called when payment gateway confirms payment
   */
  async handleWebhook(payload: {
    tenantId: string
    plan: 'starter' | 'pro' | 'enterprise'
    amount: number
    reference: string
    idempotencyKey: string
  }) {
    // Idempotency check
    const { data: existing } = await supabase
      .from('idempotency_keys')
      .select('resource_id')
      .eq('key', payload.idempotencyKey)
      .single()

    if (existing) return { alreadyProcessed: true, subId: existing.resource_id }

    const autoMode = await subscriptionService.checkAutoActivation()
    if (!autoMode) throw new ServiceError('AUTO_MODE_DISABLED', 'Auto-activation is disabled')

    // Queue auto-approval job
    const { data: job } = await supabase.from('job_queue').insert({
      job_type: 'auto_approve_subscription',
      payload: {
        tenantId: payload.tenantId,
        plan: payload.plan,
        amount: payload.amount,
        reference: payload.reference,
        idempotencyKey: payload.idempotencyKey,
      },
    }).select().single()

    return { queued: true, jobId: job?.id }
  },

  async getWallet(tenantId: string) {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('tenant_id', tenantId)
      .single()

    if (error) throw new ServiceError('WALLET_FETCH_FAILED', error.message)
    return data
  },

  async getTransactions(tenantId: string, filters: { type?: string; page?: number; limit?: number }) {
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (filters.type) query = query.eq('type', filters.type)

    const page = filters.page ?? 1
    const limit = filters.limit ?? 20
    query = query.range((page - 1) * limit, page * limit - 1)

    const { data, error, count } = await query
    if (error) throw new ServiceError('TRANSACTIONS_FETCH_FAILED', error.message)
    return { data, total: count, page, limit }
  },
}

// ============================================================
// services/reportService.ts
// ============================================================
export const reportService = {
  async getDashboardStats(tenantId: string) {
    const cacheKey = `dashboard_${tenantId}`

    // Try cache
    const { data: cached } = await supabase
      .from('cache_entries')
      .select('value')
      .eq('key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (cached) return cached.value

    // Revenue (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [
      { data: revenue },
      { data: orders },
      { data: lowStock },
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
        .select('status', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .is('deleted_at', null),
      supabase.rpc('get_low_stock_count', { p_tenant_id: tenantId }),
      supabase.from('products').select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId).is('deleted_at', null),
    ])

    const stats = {
      revenue_30d: revenue?.reduce((sum, t) => sum + t.amount, 0) ?? 0,
      orders_by_status: orders?.reduce((acc: Record<string, number>, o) => {
        acc[o.status] = (acc[o.status] ?? 0) + 1
        return acc
      }, {}) ?? {},
      low_stock_count: lowStock ?? 0,
      total_products: totalProducts ?? 0,
    }

    // Cache for 5 minutes
    await supabase.from('cache_entries').upsert({
      key: cacheKey,
      tenant_id: tenantId,
      value: stats,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    })

    return stats
  },

  async getRevenueChart(tenantId: string, days: number = 30) {
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('transactions')
      .select('amount, created_at, type')
      .eq('tenant_id', tenantId)
      .in('type', ['revenue', 'refund'])
      .gte('created_at', from)
      .order('created_at', { ascending: true })

    if (error) throw new ServiceError('CHART_FETCH_FAILED', error.message)

    // Group by date
    const grouped = (data ?? []).reduce((acc: Record<string, { revenue: number; refund: number }>, t) => {
      const date = t.created_at.split('T')[0]
      if (!acc[date]) acc[date] = { revenue: 0, refund: 0 }
      acc[date][t.type as 'revenue' | 'refund'] += t.amount
      return acc
    }, {})

    return Object.entries(grouped).map(([date, vals]) => ({ date, ...vals }))
  },
}

// ============================================================
// services/auditService.ts
// ============================================================
export const auditService = {
  async log(payload: {
    tenantId?: string
    performedBy: string
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'LOGIN' | 'LOGOUT'
    resourceType: string
    resourceId?: string
    beforeState?: Record<string, unknown>
    afterState?: Record<string, unknown>
    ipAddress?: string
  }) {
    await supabase.from('audit_logs').insert({
      tenant_id: payload.tenantId ?? null,
      performed_by: payload.performedBy,
      action: payload.action,
      resource_type: payload.resourceType,
      resource_id: payload.resourceId ?? null,
      before_state: payload.beforeState ?? null,
      after_state: payload.afterState ?? null,
      ip_address: payload.ipAddress ?? null,
    })
  },
}

// ============================================================
// services/notificationService.ts
// ============================================================
export const notificationService = {
  async send(payload: {
    tenantId?: string
    userId: string
    type: 'order' | 'subscription' | 'referral' | 'achievement' | 'alert' | 'system'
    title: string
    body?: string
    data?: Record<string, unknown>
  }) {
    const { error } = await supabase.from('notifications').insert({
      tenant_id: payload.tenantId ?? null,
      user_id: payload.userId,
      type: payload.type,
      title: payload.title,
      body: payload.body ?? null,
      data: payload.data ?? {},
    })
    if (error) console.error('[NotificationService]', error.message)
  },

  async markRead(notificationId: string, userId: string) {
    await supabase.from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId)
  },

  async getUnread(userId: string) {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(50)
    return data ?? []
  },
}

// ============================================================
// Shared Types
// ============================================================
type OrderStatus = 'pending' | 'confirmed' | 'assigned' | 'delivered' | 'failed' | 'cancelled'

// ============================================================
// Shared Error Class
// ============================================================
export class ServiceError extends Error {
  constructor(public code: string, message: string) {
    super(message)
    this.name = 'ServiceError'
  }
}

// ============================================================
// lib/rateLimit.ts
// ============================================================
export async function rateLimit(key: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const windowKey = `ratelimit_${key}_${Math.floor(Date.now() / windowMs)}`

  const { data } = await supabase
    .from('cache_entries')
    .select('value')
    .eq('key', windowKey)
    .gt('expires_at', new Date().toISOString())
    .single()

  const current = (data?.value as any)?.count ?? 0

  if (current >= maxRequests) return false

  await supabase.from('cache_entries').upsert({
    key: windowKey,
    value: { count: current + 1 },
    expires_at: new Date(Date.now() + windowMs).toISOString(),
  })

  return true
}

// ============================================================
// lib/featureFlags.ts
// ============================================================
export async function isFeatureEnabled(flagKey: string): Promise<boolean> {
  const { data } = await supabase
    .from('settings')
    .select('value, flag_status')
    .eq('key', flagKey)
    .single()

  return data?.flag_status === 'enabled' && data?.value?.enabled === true
}

// ============================================================
// lib/validate.ts — Input sanitization + validation
// ============================================================
export function validateOrderPayload(body: unknown): asserts body is {
  items: Array<{ product_id: string; quantity: number; unit_price: number }>
  shippingAddress: Record<string, unknown>
  deliveryFee?: number
} {
  if (!body || typeof body !== 'object') throw new ServiceError('VALIDATION_ERROR', 'Invalid payload')
  const b = body as Record<string, unknown>
  if (!Array.isArray(b.items) || b.items.length === 0) throw new ServiceError('VALIDATION_ERROR', 'Items required')
  if (b.items.length > 50) throw new ServiceError('VALIDATION_ERROR', 'Max 50 items per order')
  if (!b.shippingAddress || typeof b.shippingAddress !== 'object') throw new ServiceError('VALIDATION_ERROR', 'Shipping address required')
}

// Declare supabase placeholder (actual import in each file)
declare const supabase: any
