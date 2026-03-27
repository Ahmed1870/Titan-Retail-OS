import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  // الـ Middleware سيتولى التوجيه بناءً على الـ Role
  return { success: true };
}

export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}

export async function registerAction(data: any) {
  const supabase = createClient();
  const { email, password, full_name, role = 'customer' } = data;

  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, role }
    }
  });

  if (authErr) throw authErr;
  return { success: true };
}
