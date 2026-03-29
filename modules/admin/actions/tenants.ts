import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function activateTenantAction(tenantId: string, plan: 'starter' | 'pro' | 'enterprise' = 'starter') {
  const supabase = createClient();
  
  // التأكد من هوية الأدمن (Security Check)
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: 'UNAUTHORIZED' };

  const { data: adminUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (adminUser?.role !== 'admin') return { error: 'FORBIDDEN_ACCESS' };

  // استدعاء المحرك الذري (RPC)
  const { data, error } = await supabase.rpc('activate_tenant_complete', {
    p_tenant_id: tenantId,
    p_admin_id: session.user.id,
    p_plan: plan
  });

  if (error) {
    console.error('Activation Error:', error);
    return { error: error.message };
  }

  // إعادة تفعيل الكاش لضمان ظهور التاجر كـ Active فوراً
  revalidatePath('/admin');
  revalidatePath('/merchant');
  
  return { success: true, data };
}

export async function getPendingTenantsAction() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tenants')
    .select('*, users!owner_id(full_name, phone, email)')
    .eq('plan_status', 'inactive')
    .order('created_at', { ascending: false });

  if (error) return { error: error.message };
  return { data };
}
