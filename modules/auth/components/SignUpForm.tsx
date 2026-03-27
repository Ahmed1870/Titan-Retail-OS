"use client";

import { useState } from 'react';
// Import للأكشن كـ Server Action
import { signUpAction } from '@/modules/auth/actions/signUp';

export default function SignUpForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    // استدعاء الأكشن في الـ Client Side
    const result = await signUpAction(formData);
    
    if (result?.error) {
      setError(result.error);
    }
    // التوجيه بيتم داخل الأكشن على السيرفر
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}
      {/* باقي حقول الفورم هنا... */}
      <div>
        <input name="email" type="email" required placeholder="البريد الإلكتروني" className="w-full p-2 border rounded" />
      </div>
      <div>
        <input name="password" type="password" required placeholder="كلمة المرور" className="w-full p-2 border rounded" />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        إنشاء حساب
      </button>
    </form>
  );
}
