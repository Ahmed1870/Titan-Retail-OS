'use server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('full_name') as string;
  const storeName = formData.get('store_name') as string;
  const supabase = createClient();

  const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
  if (existing) return { error: "هذا الحساب موجود بالفعل، سجل دخولك." };

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  });

  if (authError) return { error: authError.message };

  if (authData.user) {
    const { data: tenant } = await supabase.from('tenants').insert([{ name: storeName }]).select().single();
    if (tenant) {
      await supabase.from('users').insert([{
        id: authData.user.id,
        email,
        full_name: fullName,
        tenant_id: tenant.id,
        role: 'merchant'
      }]);
    }
  }
  redirect('/auth/signup/success');
}
