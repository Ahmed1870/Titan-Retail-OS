import { createClient } from '@/lib/supabase/server';

export type MerchantContext = {
  tenantId: string;
  planStatus: string;
  storeName: string;
};

export async function getMerchantContextAction(): Promise<{ data?: MerchantContext; error?: string }> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return { error: 'UNAUTHORIZED' };

  // استعلام ذكي يجلب بيانات المستخدم وحالة متجره في ضربة واحدة
  const { data: user, error } = await supabase
    .from('users')
    .select('tenant_id, role, tenants!users_tenant_id_fkey(plan_status, store_name)')
    .eq('id', session.user.id)
    .single();

  if (error || !user || user.role !== 'merchant') return { error: 'FORBIDDEN' };
  if (!user.tenant_id || !user.tenants) return { error: 'NO_TENANT' };

  // استخراج البيانات من العلاقة (Relation)
  const tenantData = Array.isArray(user.tenants) ? user.tenants[0] : user.tenants;

  return {
    data: {
      tenantId: user.tenant_id,
      planStatus: tenantData.plan_status,
      storeName: tenantData.store_name,
    }
  };
}
