'use client';
import { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, msg: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, msg: '' });
    const res = await fetch('/api/auth/reset', { // يكلم الـ API بتاعك بالظبط
      method: 'POST',
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    setStatus({ loading: false, msg: data.success ? 'تم إرسال الرابط!' : data.error });
  };

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-6" dir="rtl">
      <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-8 rounded-3xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">استعادة الحساب</h2>
        <input 
          type="email" placeholder="بريدك الإلكتروني" value={email} onChange={(e)=>setEmail(e.target.value)} required
          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white mb-4 outline-none focus:border-violet-500"
        />
        <button disabled={status.loading} className="w-full bg-violet-600 p-4 rounded-xl font-bold">
          {status.loading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
        </button>
        {status.msg && <p className="mt-4 text-center text-violet-400">{status.msg}</p>}
      </form>
    </div>
  );
}
