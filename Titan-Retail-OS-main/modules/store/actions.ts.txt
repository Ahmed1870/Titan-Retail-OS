import { createClient } from '@/lib/supabase/server';

export async function getStoreDataAction(slug: string) {
  const supabase = createClient();

  // 1. جلب بيانات المتجر من الـ Slug
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id, store_name, logo_url, settings, plan_status')
    .eq('slug', slug)
    .single();

  if (tenantError || !tenant) return { error: 'STORE_NOT_FOUND' };
  if (tenant.plan_status !== 'active') return { error: 'STORE_INACTIVE' };

  // 2. جلب المنتجات المتاحة فقط لهذا المتجر
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('*, inventory(quantity)')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (prodError) return { error: prodError.message };

  return {
    data: {
      tenant,
      products: products.map(p => ({
        ...p,
        stock: Array.isArray(p.inventory) ? p.inventory[0]?.quantity : p.inventory?.quantity || 0
      }))
    }
  };
}
