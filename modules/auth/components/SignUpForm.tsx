'use client';
import { useState } from 'react';
import { signUpAction } from '@/modules/auth/actions/signUp';
import Toast from '@/modules/shared/components/Toast';
import Link from 'next/link';

export default function SignUpForm() {
  const [toast, setToast] = useState<{msg: string, type: 'error' | 'success'} | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    const result = await signUpAction(formData);
    if (result?.error) {
      setToast({ msg: result.error, type: 'error' });
      setIsPending(false);
    }
  }

  return (
    <div className="w-full max-w-xl p-10 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[80px] rounded-full"></div>
      
      <h2 className="text-3xl font-black text-white mb-2 tracking-tighter text-center">انضم لأسطول تايتان</h2>
      <p className="text-zinc-500 text-center mb-8 text-sm">ابدأ رحلة إدارة متجرك باحترافية مطلقة</p>
      
      <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-2">الاسم الكامل</label>
          <input name="full_name" type="text" required placeholder="أحمد محمد" 
            className="w-full p-4 bg-black border border-zinc-800 text-white rounded-2xl focus:border-blue-500 outline-none transition-all text-sm" />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-2">اسم المتجر</label>
          <input name="store_name" type="text" required placeholder="متجر تايتان" 
            className="w-full p-4 bg-black border border-zinc-800 text-white rounded-2xl focus:border-blue-500 outline-none transition-all text-sm" />
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-2">البريد الإلكتروني</label>
          <input name="email" type="email" required placeholder="ahmed@example.com" 
            className="w-full p-4 bg-black border border-zinc-800 text-white rounded-2xl focus:border-blue-500 outline-none transition-all text-sm" />
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-2">كلمة المرور</label>
          <input name="password" type="password" required placeholder="••••••••" 
            className="w-full p-4 bg-black border border-zinc-800 text-white rounded-2xl focus:border-blue-500 outline-none transition-all text-sm" />
        </div>

        <button disabled={isPending} className="md:col-span-2 mt-4 py-4 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all shadow-xl disabled:opacity-50">
          {isPending ? "جاري تجهيز متجرك..." : "إنشاء متجر جديد"}
        </button>
      </form>

      <p className="mt-8 text-center text-zinc-500 text-xs">
        لديك حساب بالفعل؟ <Link href="/auth/login" className="text-blue-500 font-bold hover:underline">تسجيل الدخول</Link>
      </p>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
