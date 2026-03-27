// ============================================================
// TITAN-RETAIL OS — GLOBAL TYPES
// ============================================================

// ─── ENUMS ───────────────────────────────────────────────────
export type UserRole = 'admin' | 'merchant' | 'courier' | 'customer';
export type PlanType = 'starter' | 'pro' | 'enterprise';
export type PlanStatus = 'inactive' | 'pending' | 'active' | 'suspended' | 'cancelled';
export type SubscriptionRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
export type PaymentMethod = 'vodafone_cash' | 'instapay' | 'bank_transfer' | 'webhook';
export type OrderStatus = 'pending' | 'confirmed' | 'assigned' | 'delivered' | 'failed' | 'cancelled';
export type TransactionType = 'revenue' | 'cost' | 'courier_payout' | 'platform_fee' | 'refund' | 'reward';
export type DeliveryStatus = 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type NotificationType = 'order' | 'subscription' | 'referral' | 'achievement' | 'alert' | 'system';
export type ReferralStatus = 'pending' | 'completed' | 'rewarded';
export type RewardType = 'free_plan' | 'upgrade' | 'credit' | 'discount';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'LOGIN' | 'LOGOUT';

// ─── DATABASE MODELS ─────────────────────────────────────────
export interface Tenant {
  id: string;
  store_name: string;
  slug: string;
  owner_id: string | null;
  current_plan: PlanType;
  plan_status: PlanStatus;
  plan_expires_at: string | null;
  referral_code: string;
  referred_by: string | null;
  logo_url: string | null;
  domain: string | null;
  phone: string | null;
  address: Record<string, unknown>;
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface User {
  id: string;
  tenant_id: string | null;
  role: UserRole;
  full_name: string;
  phone: string | null;
  email: string;
  avatar_url: string | null;
  is_active: boolean;
  last_seen_at: string | null;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Subscription {
  id: string;
  tenant_id: string;
  plan: PlanType;
  status: PlanStatus;
  payment_method: PaymentMethod | null;
  amount_paid: number | null;
  currency: string;
  started_at: string | null;
  expires_at: string | null;
  renewed_at: string | null;
  cancelled_at: string | null;
  idempotency_key: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionRequest {
  id: string;
  tenant_id: string;
  requested_by: string;
  plan: PlanType;
  payment_method: PaymentMethod;
  full_name: string;
  phone_number: string;
  status: SubscriptionRequestStatus;
  approved_by: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  whatsapp_link: string | null;
  idempotency_key: string | null;
  created_at: string;
  updated_at: string;
  // joins
  tenants?: Pick<Tenant, 'store_name' | 'logo_url'>;
}

export interface Product {
  id: string;
  tenant_id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  cost_price: number | null;
  tax_rate: number;
  images: string[];
  attributes: Record<string, unknown>;
  is_active: boolean;
  is_featured: boolean;
  weight_kg: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // joins
  inventory?: Inventory;
}

export interface Inventory {
  id: string;
  tenant_id: string;
  product_id: string;
  quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number;
  updated_at: string;
}

export interface InventoryLog {
  id: string;
  tenant_id: string;
  product_id: string;
  order_id: string | null;
  delta: number;
  previous_qty: number;
  new_qty: number;
  reason: string | null;
  performed_by: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  tenant_id: string;
  customer_id: string;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  delivery_fee: number;
  total: number;
  currency: string;
  shipping_address: ShippingAddress;
  notes: string | null;
  idempotency_key: string | null;
  coupon_code: string | null;
  assigned_courier_id: string | null;
  confirmed_at: string | null;
  assigned_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // joins
  order_items?: OrderItem[];
  users?: Pick<User, 'full_name' | 'phone' | 'email'>;
  deliveries?: Delivery[];
}

export interface OrderItem {
  id: string;
  tenant_id: string;
  order_id: string;
  product_id: string;
  product_snapshot: Record<string, unknown>;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  line_total: number;
  created_at: string;
  // joins
  products?: Pick<Product, 'name' | 'images' | 'sku'>;
}

export interface Delivery {
  id: string;
  tenant_id: string;
  order_id: string;
  courier_id: string | null;
  status: DeliveryStatus;
  pickup_address: Record<string, unknown>;
  dropoff_address: ShippingAddress;
  pickup_at: string | null;
  delivered_at: string | null;
  failed_reason: string | null;
  tracking_url: string | null;
  notes: string | null;
  courier_fee: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  tenant_id: string;
  order_id: string | null;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string | null;
  reference_id: string | null;
  idempotency_key: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Wallet {
  id: string;
  tenant_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  currency: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  order_id: string;
  invoice_number: string;
  snapshot: Record<string, unknown>;
  subtotal: number;
  tax_amount: number;
  total: number;
  currency: string;
  issued_at: string;
  due_at: string | null;
}

export interface SupportTicket {
  id: string;
  tenant_id: string;
  created_by: string;
  subject: string;
  status: TicketStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // joins
  messages?: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  tenant_id: string;
  sender_id: string;
  body: string;
  attachments: string[];
  is_internal: boolean;
  created_at: string;
  // joins
  sender?: Pick<User, 'full_name' | 'avatar_url' | 'role'>;
}

export interface Notification {
  id: string;
  tenant_id: string | null;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  tenant_id: string | null;
  performed_by: string | null;
  action: AuditAction;
  resource_type: string;
  resource_id: string | null;
  before_state: Record<string, unknown> | null;
  after_state: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  // joins
  performer?: Pick<User, 'full_name' | 'role'>;
}

export interface Referral {
  id: string;
  referrer_tenant_id: string;
  referred_tenant_id: string;
  status: ReferralStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string | null;
  icon: string | null;
  trigger_event: string;
  conditions: Record<string, unknown>;
  reward: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

// ─── SHARED VALUE TYPES ───────────────────────────────────────
export interface ShippingAddress {
  name?: string;
  phone?: string;
  street: string;
  city: string;
  governorate?: string;
  postal_code?: string;
  country?: string;
  notes?: string;
  lat?: number;
  lng?: number;
}

export interface PlanConfig {
  id: PlanType;
  name: string;
  price: number;
  currency: string;
  features: string[];
  limits: {
    products: number | 'unlimited';
    couriers: number | 'unlimited';
    orders_per_month: number | 'unlimited';
  };
}

// ─── API REQUEST / RESPONSE TYPES ────────────────────────────
export interface CreateOrderPayload {
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    discount?: number;
  }>;
  shipping_address: ShippingAddress;
  delivery_fee?: number;
  coupon_code?: string;
  notes?: string;
}

export interface CreateOrderResponse {
  order_id: string;
  total: number;
  invoice: string;
  idempotent?: boolean;
}

export interface CreateSubscriptionRequestPayload {
  plan: PlanType;
  payment_method: PaymentMethod;
  full_name: string;
  phone_number: string;
}

export interface DashboardStats {
  revenue_30d: number;
  orders_by_status: Record<OrderStatus, number>;
  low_stock_count: number;
  total_products: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  refund: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  error: string;
  code?: string;
}

export interface ApiSuccess<T = void> {
  success: true;
  data?: T;
}

// ─── CONTEXT TYPES ───────────────────────────────────────────
export interface AuthContext {
  user: User | null;
  tenant: Tenant | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export interface TenantContext {
  tenant: Tenant;
  subscription: Subscription | null;
  isActive: boolean;
  isPlanActive: boolean;
}
