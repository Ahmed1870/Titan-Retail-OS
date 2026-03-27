'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    setMsg(error ? error.message : 'تم تحديث كلمة السر بنجاح!');
    if (!error) setTimeout(() => window.location.href = '/auth/login', 2000);
  };

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-6" dir="rtl">
      <form onSubmit={handleUpdate} className="bg-white/5 border border-white/10 p-8 rounded-3xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">كلمة سر جديدة</h2>
        <input 
          type="password" placeholder="اكتب كلمة السر الجديدة" value={password} onChange={(e)=>setPassword(e.target.value)} required
          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white mb-4 outline-none focus:border-violet-500"
        />
        <button className="w-full bg-violet-600 p-4 rounded-xl font-bold">تحديث</button>
        {msg && <p className="mt-4 text-center text-violet-400">{msg}</p>}
      </form>
    </div>
  );
}
