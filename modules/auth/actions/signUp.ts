'use server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('full_name') as string;
  const storeName = formData.get('store_name') as string;
  const supabase = createClient();

  // توليد slug بسيط من اسم المتجر
  const slug = storeName.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 7);

  // 1. إنشاء الحساب في Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  });

  if (authError) return { error: authError.message };

  if (authData?.user) {
    // 2. إنشاء المتجر (استخدام store_name و slug بناءً على الـ Schema بتاعك)
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert([{ 
        store_name: storeName, 
        slug: slug 
      }])
      .select()
      .single();

    if (tenantError) return { error: "فشل إنشاء المتجر: " + tenantError.message };

    if (tenant) {
      // 3. ربط المستخدم بالمتجر في جدول users
      const { error: userInsertError } = await supabase.from('users').insert([{
        id: authData.user.id,
        email,
        full_name: fullName,
        tenant_id: tenant.id,
        role: 'merchant'
      }]);
      
      if (userInsertError) return { error: "فشل ربط المستخدم: " + userInsertError.message };
    }
  }

  redirect('/auth/signup/success');
}
