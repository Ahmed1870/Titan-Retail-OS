import { createClient } from '@/lib/supabase/server';

export async function getStoreDataAction(slug: string, params: { category?: string, q?: string } = {}) {
  const supabase = createClient();
  
  // جلب بيانات التاجر
  const { data: tenant } = await supabase.from('tenants')
    .select('id, store_name, logo_url')
    .eq('slug', slug)
    .eq('plan_status', 'active')
    .single();

  if (!tenant) throw new Error('Store not found');

  // جلب المنتجات
  let query = supabase.from('products')
    .select('id, name, description, price, tax_rate, images, category, inventory(quantity)')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .is('deleted_at', null);

  if (params.category) query = query.eq('category', params.category);
  if (params.q) query = query.ilike('name', `%${params.q}%`);

  const { data: products } = await query;
  return { store: tenant, products: products ?? [] };
}

export async function getCustomerOrdersAction() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Unauthorized');

  const { data } = await supabase.from('orders')
    .select('*, order_items(*, products(name, images)), deliveries(status, tracking_url)')
    .eq('customer_id', session.user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
    
  return data ?? [];
}
