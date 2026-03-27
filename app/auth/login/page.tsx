'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();
  const router = useRouter();

  // فحص الجلسة النشطة: إذا كان المستخدم مسجلاً بالفعل، يتم تحويله فوراً دون انتظار
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userRecord } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (userRecord?.role === 'merchant') router.push('/merchant');
        else if (userRecord?.role === 'admin') router.push('/admin');
        else if (userRecord?.role === 'courier') router.push('/courier');
      }
    };
    checkSession();
  }, [router, supabase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // تسجيل الدخول مع تفعيل حفظ الجلسة
    const { data, error: authError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (authError) {
      setError('خطأ في البيانات: ' + authError.message);
      setLoading(false);
      return;
    }

    // جلب الدور (Role) من السكيما الخاصة بك (Section 4) لتحديد الوجهة
    const { data: userRecord } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (userRecord?.role === 'merchant') router.push('/merchant');
    else if (userRecord?.role === 'admin') router.push('/admin');
    else if (userRecord?.role === 'courier') router.push('/courier');
    else router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20">
            <span className="text-white text-3xl font-bold">T</span>
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-white mb-2 text-center">أهلاً بك في تيتان</h2>
        <p className="text-gray-400 text-center mb-8 text-sm font-medium">سجل دخولك لإدارة تجارتك بذكاء</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-400 mr-2 font-bold">البريد الإلكتروني</label>
            <input 
              type="email" 
              name="email"
              autoComplete="username" 
              placeholder="name@company.com" 
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-violet-500 transition-all text-right"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 mr-2 font-bold">كلمة المرور</label>
            <input 
              type="password" 
              name="password"
              autoComplete="current-password" 
              placeholder="••••••••" 
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-violet-500 transition-all text-right"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading} 
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 p-4 rounded-2xl font-black text-white mt-4 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all active:scale-95"
          >
            {loading ? 'جاري التحقق من الهوية...' : 'دخول للمنصة'}
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl mt-2">
              <p className="text-red-400 text-center text-xs font-bold">{error}</p>
            </div>
          )}
        </form>
        
        <p className="text-center mt-6 text-gray-500 text-xs">
          نسيت كلمة السر؟ <a href="/auth/forgot-password"  className="text-violet-400 font-bold hover:underline">استعادة الحساب</a>
        </p>
      </div>
    </div>
  );
}
