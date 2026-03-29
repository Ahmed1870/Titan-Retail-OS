'use server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get('email') as string;
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.TITAN_APP_URL}/auth/reset-password`,
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function updatePasswordAction(formData: FormData) {
  const password = formData.get('password') as string;
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { success: true };
}
