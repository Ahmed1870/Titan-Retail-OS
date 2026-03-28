#!/bin/bash

# 1. إنشاء هيكل المجلدات (Modules + App)
mkdir -p modules/auth/actions \
         modules/auth/components \
         modules/shared/components \
         app/auth/login \
         app/auth/register \
         app/auth/forgot-password \
         app/auth/reset-password \
         app/auth/signup/success

echo "✅ تم إنشاء هيكل المجلدات بنجاح."

# 2. إنشاء ملف الأكشن الرئيسي (Logic)
cat << 'INNER_EOF' > modules/auth/actions/index.ts
'use server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get('email') as string;
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: \`\${process.env.TITAN_APP_URL}/auth/reset-password\`,
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
INNER_EOF

# 3. إنشاء الأكشن الخاص بالدخول والتوجيه الذكي
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

  if (userProfile?.role === 'admin') redirect('/admin');
  if (userProfile?.role === 'merchant') redirect('/merchant/dashboard');
  redirect('/');
}
INNER_EOF

# 4. إنشاء مكون التنبيه (Toast) الفخم
cat << 'INNER_EOF' > modules/shared/components/Toast.tsx
'use client';
import { useEffect } from 'react';

export default function Toast({ message, type = 'error', onClose }: { message: string, type?: 'error' | 'success', onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = type === 'error' ? 'border-red-500/50 bg-red-900/20 text-red-400' : 'border-green-500/50 bg-green-900/20 text-green-400';

  return (
    <div className={\`fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-2xl border backdrop-blur-md shadow-2xl \${colors} animate-pulse\`}>
      <div className="flex items-center gap-3 font-bold text-sm">
        {message}
      </div>
    </div>
  );
}
INNER_EOF

# 5. ربط المسارات بـ App Router
cat << 'INNER_EOF' > app/auth/login/page.tsx
import LoginForm from '@/modules/auth/components/LoginForm';
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <LoginForm />
    </div>
  );
}
INNER_EOF

echo "🚀 تم توزيع الأسطول البرمجي بنجاح!"
