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
