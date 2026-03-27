import { createClient } from '@/lib/supabase/server';
import { PLAN_LIMITS, PlanType } from '@/lib/config/plans';

export async function getStoreMetadata(slug: string) {
  const supabase = createClient();
  
  // جلب بيانات المتجر بناءً على الرابط (Slug)
  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('*, owner_id(full_name)')
    .eq('slug', slug)
    .single();

  if (error || !tenant) return null;

  const plan = tenant.current_plan as PlanType;
  const config = PLAN_LIMITS[plan];

  return {
    title: tenant.name,
    description: tenant.description || `Welcome to ${tenant.name} on Titan OS`,
    primaryColor: tenant.settings?.primaryColor || '#10b981',
    canCustomBrand: config.can_custom_brand,
    tenantId: tenant.id
  };
}
