import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateSettingsAction(newSettings: Record<string, any>) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: 'UNAUTHORIZED' };

  // جلب tenant_id للمستخدم الحالي
  const { data: user } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', session.user.id)
    .single();

  if (!user?.tenant_id) return { error: 'TENANT_NOT_FOUND' };

  // استدعاء المفاعل النووي للتحديث
  const { data, error } = await supabase.rpc('update_tenant_settings', {
    p_tenant_id: user.tenant_id,
    p_new_settings: newSettings
  });

  if (error) return { error: error.message };

  // إعادة بناء المسارات المتأثرة (خصوصاً المتجر العام)
  revalidatePath('/merchant/settings');
  revalidatePath('/store/[slug]', 'layout'); 
  
  return { success: true, settings: data };
}
