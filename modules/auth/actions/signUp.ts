"use server";

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // توجيه المستخدم لصفحة نجاح التسجيل أو تأكيد الإيميل
  redirect('/signup/success'); 
}
