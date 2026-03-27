'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setMsg('خطأ: ' + error.message);
    else {
      setMsg('تم التحديث بنجاح! جاري تحويلك...');
      setTimeout(() => window.location.href = '/auth/login', 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl border-t-emerald-500/50">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">كلمة سر جديدة</h2>
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <input 
            type="password" placeholder="أدخل كلمة السر الجديدة" value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={6}
            className="bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-emerald-500 transition-all"
          />
          <button disabled={loading} className="bg-emerald-600 p-4 rounded-xl font-bold">
            {loading ? 'جاري الحفظ...' : 'تحديث كلمة السر'}
          </button>
          {msg && <p className="text-center text-sm text-emerald-400 mt-2">{msg}</p>}
        </form>
      </div>
    </div>
  );
}
