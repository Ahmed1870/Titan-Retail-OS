'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert("خطأ: " + error.message);
    } else {
      // توجيه ذكي بناءً على الإيميل (الأدمن يروح للأدمن)
      if (email === 'admin@titan.os') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-6">
      <form onSubmit={handleLogin} className="bg-white/5 p-8 rounded-2xl border border-white/10 w-full max-w-md">
        <h2 className="text-3xl font-black text-white mb-6 text-center">Titan Login</h2>
        <input 
          type="email" placeholder="Email" 
          className="w-full p-3 mb-4 bg-white/5 border border-white/10 rounded-lg text-white"
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" placeholder="Password" 
          className="w-full p-3 mb-6 bg-white/5 border border-white/10 rounded-lg text-white"
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200">
          دخول
        </button>
      </form>
    </div>
  );
}
