'use client';
import { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) setMsg({ type: 'success', text: 'تم إرسال الرابط! تفقد بريدك الإلكتروني.' });
      else setMsg({ type: 'error', text: data.error });
    } catch (err) { setMsg({ type: 'error', text: 'فشل الاتصال بالسيرفر' }); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl border-t-violet-500/50">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">استعادة الحساب</h2>
        <p className="text-gray-400 text-center mb-8 text-sm text-balance">أدخل بريدك الإلكتروني للحصول على رابط تعيين كلمة السر الجديدة.</p>
        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <input 
            type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e)=>setEmail(e.target.value)} required
            className="bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-violet-500 transition-all text-right"
          />
          <button disabled={loading} className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 rounded-xl font-bold hover:opacity-90">
            {loading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
          </button>
          {msg.text && <p className={`text-center text-sm font-medium ${msg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>{msg.text}</p>}
        </form>
      </div>
    </div>
  );
}
