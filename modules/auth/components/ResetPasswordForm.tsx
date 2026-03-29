'use client'
import { useState } from 'react';
import { updatePasswordAction } from '@/modules/auth/actions';
import Toast from '@/modules/shared/components/Toast';

export default function ResetPasswordForm() {
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  async function handleSubmit(formData: FormData) {
    const res = await updatePasswordAction(formData);
    if (res?.error) setToast({ msg: res.error, type: 'error' });
    else {
      setToast({ msg: 'تم تحديث كلمة السر بنجاح، جاري تحويلك...', type: 'success' });
      setTimeout(() => window.location.href = '/auth/login', 2000);
    }
  }

  return (
    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-10 rounded-[2.5rem] shadow-2xl">
      <h2 className="text-2xl font-black text-white mb-6 text-center tracking-tight">كلمة سر جديدة</h2>
      <form action={handleSubmit} className="space-y-4">
        <input name="password" type="password" placeholder="أدخل كلمة المرور الجديدة" required 
          className="w-full p-4 bg-black border border-zinc-800 text-white rounded-2xl focus:border-blue-500 outline-none transition-all" />
        <button className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-zinc-200 transition-all shadow-xl">
          تحديث كلمة السر
        </button>
      </form>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
