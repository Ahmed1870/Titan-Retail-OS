#!/bin/bash

# 1. التأكد من وجود المجلدات
mkdir -p modules/auth/actions modules/auth/components modules/shared/components app/auth/login app/auth/register app/auth/signup/success

# 2. تحديث ملفات الأكشن (Logic)
cat << 'INNER_EOF' > modules/auth/actions/signIn.ts
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
INNER_EOF

cat << 'INNER_EOF' > modules/auth/actions/signUp.ts
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
INNER_EOF

# 3. تحديث واجهة الدخول (LoginForm) لتدعم التوجيه
cat << 'INNER_EOF' > modules/auth/components/LoginForm.tsx
'use client';
import { useState } from 'react';
import { signInAction } from '@/modules/auth/actions/signIn';
import Toast from '@/modules/shared/components/Toast';

export default function LoginForm() {
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function handle(formData: FormData) {
    setLoading(true);
    const res = await signInAction(formData);
    if (res?.error) { setErr(res.error); setLoading(false); }
  }

  return (
    <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl">
      <h2 className="text-2xl font-black text-white mb-6 text-center italic">TITAN LOGIN</h2>
      <form action={handle} className="space-y-4">
        <input name="email" type="email" placeholder="البريد الإلكتروني" required className="w-full p-4 bg-black border border-zinc-800 text-white rounded-xl focus:border-blue-500 outline-none" />
        <input name="password" type="password" placeholder="كلمة المرور" required className="w-full p-4 bg-black border border-zinc-800 text-white rounded-xl focus:border-blue-500 outline-none" />
        <button disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all">
          {loading ? "جاري الدخول..." : "تسجيل الدخول"}
        </button>
      </form>
      {err && <Toast message={err} onClose={() => setErr('')} />}
    </div>
  );
}
INNER_EOF

echo "✅ تم تحديث أسطول الـ Auth والربط بالداشبورد بنجاح!"
