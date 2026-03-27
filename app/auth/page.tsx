'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Lock, User, Store, ArrowRight, KeyRound, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TitanAuth() {
  const router = useRouter();
  const [view, setView] = useState<'login' | 'register' | 'reset'>('login');
  const [loading, setLoading] = useState(false);

  const inputStyle = "w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-violet-500/50 focus:ring-4 ring-violet-500/10 transition-all placeholder:text-gray-700 shadow-inner";

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // هنا السيستم بيعمل Redirect للداش بورد بعد التحقق
    setTimeout(() => {
      router.push('/merchant/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] -top-40 -left-40 animate-pulse" />
      <div className="absolute w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] -bottom-20 -right-20" />

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[440px] z-10">
        <div className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-3xl p-10 rounded-[45px] shadow-2xl relative overflow-hidden">
          <div className="flex flex-col items-center mb-10">
            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }} className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mb-6 shadow-2xl shadow-violet-500/40 border border-white/20">
              <ShieldCheck size={42} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Titan <span className="text-violet-500">OS</span></h1>
          </div>

          <AnimatePresence mode="wait">
            {view === 'login' && (
              <motion.form key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleAuth} className="space-y-5">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-violet-500 transition-colors" size={18} />
                  <input type="email" placeholder="البريد الإلكتروني الرسمي" className={inputStyle} required />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-violet-500 transition-colors" size={18} />
                  <input type="password" placeholder="كلمة المرور المشفرة" className={inputStyle} required />
                </div>
                <button disabled={loading} className="w-full py-4 bg-violet-600 rounded-2xl font-black text-white hover:bg-violet-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-violet-600/20 disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" /> : <>دخول الحصن <ArrowRight size={20} /></>}
                </button>
                <div className="flex justify-between text-[11px] px-2 font-bold uppercase tracking-wider">
                  <button type="button" onClick={() => setView('reset')} className="text-gray-500 hover:text-white transition-colors">فقدت المفتاح؟</button>
                  <button type="button" onClick={() => setView('register')} className="text-violet-400 hover:text-violet-300">تأسيس منشأة</button>
                </div>
              </motion.form>
            )}

            {view === 'register' && (
              <motion.form key="reg" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} /><input type="text" placeholder="اسم التاجر" className={inputStyle} /></div>
                <div className="relative"><Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} /><input type="text" placeholder="اسم المتجر" className={inputStyle} /></div>
                <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} /><input type="email" placeholder="البريد الإلكتروني" className={inputStyle} /></div>
                <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} /><input type="password" placeholder="كلمة المرور" className={inputStyle} /></div>
                <button className="w-full py-4 bg-emerald-600 rounded-2xl font-black text-white hover:bg-emerald-500 transition-all">تفعيل البروتوكول ➔</button>
                <button type="button" onClick={() => setView('login')} className="w-full text-[11px] text-gray-500 text-center hover:text-white mt-4 underline uppercase tracking-widest">العودة للبوابة</button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
        <p className="text-center text-[9px] text-gray-800 mt-12 tracking-[0.6em] font-black uppercase">Infrastructure v4.0.2</p>
      </motion.div>
    </div>
  );
}
