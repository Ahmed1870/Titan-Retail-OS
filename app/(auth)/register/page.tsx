'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. إنشاء الحساب والـ Tenant عبر الـ API اللي عملناه
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, store_name: storeName }),
    });

    if (res.ok) {
      // 2. تسجيل الدخول تلقائياً بعد التسجيل
      await supabase.auth.signInWithPassword({ email, password });
      router.push('/dashboard');
    } else {
      const err = await res.json();
      alert("خطأ في التسجيل: " + err.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-6">
      <form onSubmit={handleRegister} className="bg-white/5 p-8 rounded-2xl border border-white/10 w-full max-w-md">
        <h2 className="text-3xl font-black text-white mb-6 text-center">Join Titan OS</h2>
        <input 
          type="text" placeholder="اسم المتجر (بالانجليزية)" 
          className="w-full p-3 mb-4 bg-white/5 border border-white/10 rounded-lg text-white"
          onChange={(e) => setStoreName(e.target.value)} required 
        />
        <input 
          type="email" placeholder="البريد الإلكتروني" 
          className="w-full p-3 mb-4 bg-white/5 border border-white/10 rounded-lg text-white"
          onChange={(e) => setEmail(e.target.value)} required 
        />
        <input 
          type="password" placeholder="كلمة المرور" 
          className="w-full p-3 mb-6 bg-white/5 border border-white/10 rounded-lg text-white"
          onChange={(e) => setPassword(e.target.value)} required 
        />
        <button 
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition"
        >
          {loading ? 'جاري التأسيس...' : 'إنشاء متجر الآن'}
        </button>
      </form>
    </div>
  );
}
