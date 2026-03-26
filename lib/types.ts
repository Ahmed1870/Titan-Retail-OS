export type UserRole = 'admin' | 'merchant' | 'courier' | 'customer';
export type PlanType = 'starter' | 'pro' | 'enterprise';
export type PlanStatus = 'inactive' | 'pending' | 'active' | 'suspended' | 'cancelled';
export type OrderStatus = 'pending' | 'confirmed' | 'assigned' | 'delivered' | 'failed' | 'cancelled';

export interface Tenant {
  id: string;
  store_name: string;
  slug: string;
  owner_id: string;
  current_plan: PlanType;
  plan_status: PlanStatus;
  plan_expires_at: string | null;
  referral_code: string;
}

export interface UserProfile {
  id: string;
  tenant_id: string;
  role: UserRole;
  full_name: string;
  email: string;
  last_seen_at: string;
}

export interface Order {
  id: string;
  tenant_id: string;
  customer_id: string;
  status: OrderStatus;
  subtotal: number;
  tax_amount: number;
  total: number;
  delivery_fee: number;
  shipping_address: Record<string, any>;
  created_at: string;
}
