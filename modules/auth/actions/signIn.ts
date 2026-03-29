'use server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "خطأ في البريد أو كلمة المرور" };

  const { data: userProfile } = await supabase
    .from('users')
    .select('role, tenant_id')
    .eq('id', data.user.id)
    .single();

  if (!userProfile) return { error: "لم يتم العثور على ملف تعريف لهذا الحساب" };

  if (userProfile.role === 'admin') redirect('/admin');
  if (userProfile.role === 'merchant') redirect('/merchant/dashboard');
  redirect('/');
}
