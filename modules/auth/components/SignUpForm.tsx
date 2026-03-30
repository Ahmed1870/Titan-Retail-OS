'use client'
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
    if (result?.error) { setToast({ msg: result.error, type: 'error' }); setIsPending(false); }
  }

  return (
    <div className="w-full max-w-2xl p-12 glass-card rounded-[3rem] animate-slide-up overflow-hidden relative">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 blur-[120px] rounded-full animate-glow"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter">إنشاء كيان</h2>
            <p className="text-zinc-500 text-sm mt-1">ابدأ عهد تايتان الجديد لمتجرك</p>
          </div>
          <div className="text-[10px] font-mono text-blue-500 border border-blue-500/20 px-2 py-1 rounded">v3.0.1</div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">الهوية الكاملة</label>
            <input name="full_name" type="text" required placeholder="أحمد محمد" className="input-premium" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">العلامة التجارية</label>
            <input name="store_name" type="text" required placeholder="متجر تايتان" className="input-premium" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">قناة الاتصال</label>
            <input name="email" type="email" required placeholder="ahmed@titan.os" className="input-premium" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">مفتاح الوصول</label>
            <input name="password" type="password" required placeholder="••••••••" className="input-premium" />
          </div>
          <button disabled={isPending} className="md:col-span-2 mt-6 py-5 bg-white text-black font-black rounded-2xl hover:shadow-[0_0_50px_rgba(255,255,255,0.15)] transition-all active:scale-[0.98] disabled:opacity-50 text-lg uppercase tracking-wider">
            {isPending ? "جاري تهيئة النظام..." : "تفعيل الحساب الآن"}
          </button>
        </form>

        <p className="mt-10 text-center text-zinc-600 text-xs font-medium">
          عضو سابق؟ <Link href="/auth/login" className="text-white hover:text-blue-500 transition-colors underline underline-offset-4">الولوج للقاعدة</Link>
        </p>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
