'use client'
import { useState } from 'react';
import { forgotPasswordAction } from '@/modules/auth/actions';
import Toast from '@/modules/shared/components/Toast';

export default function ForgotPasswordForm() {
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  async function handleSubmit(formData: FormData) {
    const res = await forgotPasswordAction(formData);
    if (res?.error) setToast({ msg: res.error, type: 'error' });
    else setToast({ msg: 'تم إرسال رابط الاستعادة بنجاح', type: 'success' });
  }

  return (
    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
      <h2 className="text-2xl font-black text-white mb-6">استعادة الدخول</h2>
      <form action={handleSubmit} className="space-y-4">
        <input name="email" type="email" placeholder="البريد الإلكتروني" required 
          className="w-full p-4 bg-black border border-zinc-800 text-white rounded-xl focus:border-blue-500 outline-none transition-all" />
        <button className="w-full btn-primary-glow py-4 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-600/20">
          إرسال الرابط
        </button>
      </form>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
