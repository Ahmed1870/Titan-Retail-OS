import { supabase } from '@/lib/supabase/server';

export const updateStaffPermissions = async (userId: string, tenantId: string, role: 'admin' | 'staff') => {
  const { data, error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)
    .eq('tenant_id', tenantId);

  if (error) return { success: false, message: error.message };
  
  // تسجيل العملية في Audit Logs (Clean Code Requirement)
  await supabase.from('audit_logs').insert([{
    tenant_id: tenantId,
    action: 'PERMISSION_CHANGE',
    resource_type: 'users',
    resource_id: userId,
    metadata: { new_role: role }
  }]);

  return { success: true };
};
