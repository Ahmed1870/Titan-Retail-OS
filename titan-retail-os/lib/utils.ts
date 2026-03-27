// lib/rateLimit.ts
import { createServiceClient } from '@/lib/supabase/server';

/**
 * Rate limit using cache_entries table as a distributed counter.
 * Returns true if request is allowed, false if limit exceeded.
 */
export async function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<boolean> {
  const supabase = createServiceClient();
  const windowKey = `rl_${identifier}_${Math.floor(Date.now() / windowMs)}`;

  try {
    const { data } = await supabase
      .from('cache_entries')
      .select('value')
      .eq('key', windowKey)
      .gt('expires_at', new Date().toISOString())
      .single();

    const current = (data?.value as any)?.count ?? 0;
    if (current >= maxRequests) return false;

    await supabase.from('cache_entries').upsert({
      key: windowKey,
      value: { count: current + 1 },
      expires_at: new Date(Date.now() + windowMs).toISOString(),
    });

    return true;
  } catch {
    return true; // Fail open — don't block on cache errors
  }
}

// ─────────────────────────────────────────────────────────────
// lib/featureFlags.ts
// ─────────────────────────────────────────────────────────────
export async function isFeatureEnabled(flagKey: string): Promise<boolean> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('settings')
    .select('value, flag_status')
    .eq('key', flagKey)
    .single();

  return data?.flag_status === 'enabled' && data?.value?.enabled === true;
}

export async function getSetting<T = unknown>(key: string, defaultValue: T): Promise<T> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();
  return (data?.value as T) ?? defaultValue;
}

// ─────────────────────────────────────────────────────────────
// lib/validate.ts
// ─────────────────────────────────────────────────────────────
import { z } from 'zod';
import { ServiceError } from '@/services/errors';

export const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive().max(1000),
  unit_price: z.number().nonnegative(),
  discount: z.number().nonnegative().optional(),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1).max(50),
  shipping_address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    phone: z.string().optional(),
    name: z.string().optional(),
  }),
  delivery_fee: z.number().nonnegative().optional(),
  coupon_code: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const subscriptionRequestSchema = z.object({
  plan: z.enum(['starter', 'pro', 'enterprise']),
  payment_method: z.enum(['vodafone_cash', 'instapay', 'bank_transfer']),
  full_name: z.string().min(2).max(100),
  phone_number: z.string().regex(/^01[0-9]{9}$/, 'Must be a valid Egyptian phone number'),
});

export const createProductSchema = z.object({
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: z.string().max(100).optional(),
  price: z.number().nonnegative(),
  cost_price: z.number().nonnegative().optional(),
  tax_rate: z.number().min(0).max(100).optional(),
  initial_stock: z.number().int().nonnegative().optional(),
  images: z.array(z.string().url()).max(10).optional(),
  attributes: z.record(z.unknown()).optional(),
});

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const messages = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new ServiceError('VALIDATION_ERROR', messages);
  }
  return result.data;
}

// ─────────────────────────────────────────────────────────────
// lib/taxCalculator.ts
// ─────────────────────────────────────────────────────────────
export function calculateTax(
  amount: number,
  taxRatePercent: number,
  inclusive: boolean = false
): { tax: number; net: number; total: number } {
  if (inclusive) {
    const net = Math.round((amount / (1 + taxRatePercent / 100)) * 100) / 100;
    const tax = Math.round((amount - net) * 100) / 100;
    return { tax, net, total: amount };
  }
  const tax = Math.round(amount * (taxRatePercent / 100) * 100) / 100;
  return { tax, net: amount, total: Math.round((amount + tax) * 100) / 100 };
}

export function calculateOrderTotals(items: Array<{
  unit_price: number;
  quantity: number;
  discount?: number;
  tax_rate: number;
}>) {
  let subtotal = 0;
  let totalTax = 0;

  for (const item of items) {
    const base = (item.unit_price - (item.discount ?? 0)) * item.quantity;
    const { tax } = calculateTax(base, item.tax_rate);
    subtotal += base;
    totalTax += tax;
  }

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(totalTax * 100) / 100,
  };
}
