'use client'
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
    <div className="w-full max-w-md p-10 glass-card rounded-[2.5rem] animate-slide-up relative">
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full animate-pulse"></div>
      
      <div className="relative z-10">
        <h2 className="text-4xl font-black text-white mb-2 tracking-tighter italic italic">TITAN<span className="text-blue-500 text-sm not-italic ml-1 font-light opacity-50">CORE</span></h2>
        <p className="text-zinc-500 mb-8 text-sm font-medium">أهلاً بك في نظام التشغيل المستقبلي</p>
        
        <form action={handle} className="space-y-4">
          <input name="email" type="email" placeholder="البريد الإلكتروني" required className="input-premium" />
          <input name="password" type="password" placeholder="كلمة المرور" required className="input-premium" />
          <button disabled={loading} className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all active:scale-95 disabled:opacity-50">
            {loading ? "جاري المصادقة..." : "دخول النظام"}
          </button>
        </form>
      </div>
      {err && <Toast message={err} onClose={() => setErr('')} />}
    </div>
  );
}
