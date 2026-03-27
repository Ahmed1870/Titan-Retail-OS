import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  // 1. المصادقة عبر Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) return { error: 'Invalid credentials' };

  // 2. جلب بيانات المستخدم والدور من جدول users (Schema v2.0)
  const { data: userRecord, error: userError } = await supabase
    .from('users')
    .select('id, role, full_name')
    .eq('id', authData.user.id)
    .single();

  if (userError || !userRecord) return { error: 'User record not found' };

  // 3. منطق التوجيه بناءً على الدور (Role-Based Routing)
  if (userRecord.role === 'admin') {
    redirect('/admin/superadmin');
  }

  // إذا كان تاجراً أو موظفاً، يجب جلب الـ Tenant المرتبط به
  const { data: tenant } = await supabase
    .from('tenants')
    .select('slug')
    .eq('owner_id', userRecord.id)
    .single();

  if (tenant) {
    redirect(`/merchant/dashboard`);
  }

  // توجيه افتراضي للمستخدمين العاديين أو الموظفين
  redirect('/');
}
