'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TitanAuth() {
  const router = useRouter();
  const [view, setView] = useState('login');
  
  // دالة الدخول الفوري (عشان تشوف الداش بورد)
  const handleLogin = (e: any) => {
    e.preventDefault();
    router.push('/merchant/dashboard'); // هيدخلك على الداش بورد فوراً
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* الأنوار البنفسجية النابضة */}
      <div className="absolute w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] -top-20 -left-20 animate-pulse" />
      
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[400px] z-10">
        <div className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-3xl p-10 rounded-[40px] shadow-2xl">
          <div className="flex justify-center mb-8">
             <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/40">
                <ShieldCheck size={32} className="text-white" />
             </div>
          </div>
          
          <h2 className="text-white text-2xl font-black text-center mb-10 tracking-tight">بوابة العبور الآمن</h2>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-violet-500 transition-colors" size={18} />
              <input type="email" placeholder="البريد الإلكتروني" required className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-violet-500/50 focus:ring-4 ring-violet-500/10 transition-all placeholder:text-gray-700" />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-violet-500 transition-colors" size={18} />
              <input type="password" placeholder="كلمة المرور" required className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-violet-500/50 focus:ring-4 ring-violet-500/10 transition-all placeholder:text-gray-700" />
            </div>

            <button type="submit" className="w-full py-4 bg-violet-600 rounded-2xl font-black text-white hover:bg-violet-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-violet-600/20">
              فك القفل والخول <ArrowRight size={20} />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
