import { createClient } from '@/lib/supabase/server';
import { PLAN_LIMITS, PlanType } from '@/lib/config/plans';
import { revalidatePath } from 'next/cache';

export async function createProductAction(payload: any) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: 'UNAUTHORIZED' };

  // 1. جلب بيانات التاجر وخُطته الحالية
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, current_plan, plan_status')
    .eq('owner_id', session.user.id)
    .single();

  if (!tenant || tenant.plan_status !== 'active') return { error: 'INACTIVE_PLAN' };

  // 2. فحص الكوتا (Quota Check)
  const plan = tenant.current_plan as PlanType;
  const limit = PLAN_LIMITS[plan].max_products;

  // جلب عدد المنتجات الحالي
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenant.id);

  if (count && count >= limit) {
    return { 
      error: 'LIMIT_REACHED', 
      message: `Your current plan (${plan}) allows only ${limit} products. Please upgrade to add more.` 
    };
  }

  // 3. التنفيذ إذا اجتاز الفحص
  const { data, error } = await supabase.rpc('create_product_with_inventory', {
    p_tenant_id: tenant.id,
    p_name: payload.name,
    p_price: payload.price,
    p_quantity: payload.quantity,
    p_sku: payload.sku || `SKU-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    p_category: payload.category || 'General',
    p_images: payload.images || [],
    p_performed_by: session.user.id
  });

  if (error) return { error: error.message };

  revalidatePath('/merchant/inventory');
  return { success: true };
}
