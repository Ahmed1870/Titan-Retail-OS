import { createClient } from '@/lib/supabase/server'

export async function getStoreDataAction(slug: string) {
  const supabase = createClient()
  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('id, store_name, logo_url, settings, plan_status')
    .eq('slug', slug)
    .single()

  if (error || !tenant) return { error: 'STORE_NOT_FOUND' }
  if (tenant.plan_status !== 'active') return { error: 'STORE_INACTIVE' }

  const { data: products } = await supabase
    .from('products')
    .select('*, inventory(quantity)')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return {
    data: {
      tenant,
      products: (products ?? []).map((p: any) => ({
        ...p,
        stock: Array.isArray(p.inventory)
          ? p.inventory[0]?.quantity ?? 0
          : p.inventory?.quantity ?? 0
      }))
    }
  }
}
