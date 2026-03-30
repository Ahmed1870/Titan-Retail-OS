'use server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('full_name') as string;
  const storeName = formData.get('store_name') as string;
  const supabase = createClient();

  // 1. التأكد من عدم وجود المستخدم مسبقاً
  const { data: existing, error: findError } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
  if (findError) return { error: findError.message };
  if (existing) return { error: "هذا الحساب موجود بالفعل، سجل دخولك." };

  // 2. إنشاء الحساب في جدول الـ Auth (Supabase Auth)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  });

  if (authError) return { error: authError.message };

  // 3. (أهم خطوة) التأكد من نجاح الـ Auth Data، وإنشاء المتجر والمستخدم
  if (authData?.user) {
    // أنشئ المتجر الأول
    const { data: tenant, error: tenantError } = await supabase.from('tenants').insert([{ name: storeName }]).select().single();
    if (tenantError) return { error: "فشل إنشاء المتجر: " + tenantError.message };

    if (tenant) {
      // أنشئ المستخدم واربطه بالمتجر
      const { error: userInsertError } = await supabase.from('users').insert([{
        id: authData.user.id,
        email,
        full_name: fullName,
        tenant_id: tenant.id,
        role: 'merchant'
      }]);
      
      // إذا فشل الـ Insert في Users، نرجع خطأ ولا ننتظر الـ Redirect
      if (userInsertError) return { error: "فشل إنشاء المستخدم في البيانات: " + userInsertError.message };
    }
  }

  // 4. لا يحدث الـ Redirect إلا بعد نجاح كل الخطوات أعلاه
  redirect('/auth/signup/success');
}
