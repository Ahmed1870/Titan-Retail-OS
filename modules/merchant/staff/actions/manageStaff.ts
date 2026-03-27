import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addStaffAction(payload: { email: string, name: string, role: 'staff' | 'manager' }) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: 'UNAUTHORIZED' };

  // 1. جلب الـ Tenant ID الخاص بالتاجر الحالي
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('owner_id', session.user.id)
    .single();

  if (!tenant) return { error: 'TENANT_NOT_FOUND' };

  // 2. إنشاء مستخدم جديد في جدول users (Schema v2.0)
  // ملاحظة: في النظام الحقيقي نستخدم supabase.auth.admin لإرسال دعوة
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      full_name: payload.name,
      email: payload.email,
      role: payload.role,
      // نربطه بالـ Tenant عبر حقل مخصص أو جدول وسيط
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // 3. تسجيل العملية في سجل النشاط (The Audit Trail)
  await supabase.from('activity_logs').insert({
    tenant_id: tenant.id,
    user_id: session.user.id,
    action_type: 'ADD_STAFF',
    metadata: { staff_email: payload.email, role: payload.role }
  });

  revalidatePath('/merchant/staff');
  return { success: true };
}
