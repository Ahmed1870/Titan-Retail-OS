"use client";

import { useState } from 'react';
import { signInAction } from '@/modules/auth/actions/signIn';

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      const result = await signInAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch (e) {
      setError("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md p-8 bg-zinc-900 rounded-lg shadow-xl border border-zinc-800">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">تسجيل الدخول - تايتان</h2>
      <form action={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-500/10 border border-red-500 text-red-500 text-sm rounded">{error}</div>}
        <input 
          name="email" 
          type="email" 
          placeholder="البريد الإلكتروني" 
          required 
          className="w-full p-3 bg-zinc-800 border border-zinc-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input 
          name="password" 
          type="password" 
          placeholder="كلمة المرور" 
          required 
          className="w-full p-3 bg-zinc-800 border border-zinc-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition duration-200 disabled:opacity-50"
        >
          {loading ? "جاري الدخول..." : "دخول"}
        </button>
      </form>
    </div>
  );
}
