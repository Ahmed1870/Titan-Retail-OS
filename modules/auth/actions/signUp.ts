import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signUpAction(formData: FormData) {
  const supabase = createClient();
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const storeName = formData.get('storeName') as string;
  const fullName = formData.get('fullName') as string;

  // 1. إنشاء الحساب في Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  });

  if (authError) throw new Error(authError.message);

  const userId = authData.user?.id;

  if (userId) {
    // 2. إنشاء المتجر (Tenant) في السكيما v3.1
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: storeName,
        owner_id: userId,
        plan_type: 'starter', // الباقة الافتراضية
        settings: { currency: 'EGP', phone: '' }
      })
      .select()
      .single();

    if (tenantError) throw new Error(tenantError.message);

    // 3. تحديث دور المستخدم ليكون 'merchant'
    await supabase.from('users').update({ 
      role: 'merchant', 
      tenant_id: tenant.id 
    }).eq('id', userId);

    // 4. ضبط إعدادات الضرائب الافتراضية (Matching Schema v3.1)
    await supabase.from('tax_settings').insert({
      tenant_id: tenant.id,
      vat_percent: 14,
      is_tax_inclusive: true
    });
  }

  return redirect('/merchant/dashboard');
}
