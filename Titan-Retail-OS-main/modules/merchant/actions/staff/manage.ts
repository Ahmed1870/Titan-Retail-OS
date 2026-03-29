import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addStaffAction(payload: {
  email: string;
  role: 'manager' | 'inventory_clerk' | 'sales_agent';
  permissions: any;
}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: 'UNAUTHORIZED' };

  // 1. التحقق من أن المستخدم الحالي هو صاحب المتجر (Security Check)
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('owner_id', session.user.id)
    .single();

  if (!tenant) return { error: 'ONLY_OWNER_CAN_ADD_STAFF' };

  // 2. البحث عن المستخدم المراد إضافته (يجب أن يكون مسجلاً في النظام)
  const { data: targetUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', payload.email)
    .single();

  if (!targetUser) return { error: 'USER_NOT_FOUND_IN_TITAN' };

  // 3. إضافة الموظف للمتجر
  const { error } = await supabase
    .from('tenant_staff')
    .insert({
      tenant_id: tenant.id,
      user_id: targetUser.id,
      role: payload.role,
      permissions: payload.permissions
    });

  if (error) {
    if (error.code === '23505') return { error: 'USER_ALREADY_STAFF' };
    return { error: error.message };
  }

  revalidatePath('/merchant/staff');
  return { success: true };
}

export async function getStaffListAction() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const { data, error } = await supabase
    .from('tenant_staff')
    .select('*, users(full_name, email, phone)')
    .order('created_at', { ascending: false });

  if (error) return { error: error.message };
  return { data };
}
