'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Store, User, ShieldCheck, ArrowRight, KeyRound } from 'lucide-react';

export default function TitanAuth() {
  const [view, setView] = useState<'login' | 'register' | 'reset'>('login');

  // الستايل الموحد للحقول (Clean Design System)
  const inputStyle = "w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-200 outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition-all placeholder:text-gray-600 shadow-inner";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#05070a]">
      {/* تأثيرات الإضاءة المحيطية (Cyber Ambience) */}
      <div className="absolute w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] -top-40 -left-40 animate-pulse" />
      <div className="absolute w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -bottom-20 -right-20 animate-pulse" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="w-full max-w-[420px] relative z-10">
        
        {/* اللوجو "قلب المفاعل" */}
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mb-6 shadow-2xl shadow-violet-500/40 border border-white/20"
          >
            <ShieldCheck size={42} className="text-white" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter text-white">TITAN <span className="text-violet-500 underline decoration-violet-500/30">OS</span></h1>
          <p className="text-gray-500 text-[10px] mt-3 uppercase tracking-[0.4em] font-bold">Secure Access Protocol</p>
        </div>

        {/* الحاوية الزجاجية (The Vault Shell) */}
        <div className="p-10 rounded-[40px] backdrop-blur-3xl border border-white/[0.1] bg-white/[0.02] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* خط ليزر ديكوري في الأعلى */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
          
          <AnimatePresence mode="wait">
            
            {/* 1. واجهة الدخول */}
            {view === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.3 }}>
                <h2 className="text-xl font-bold text-white text-center mb-10">بوابة العبور</h2>
                <div className="space-y-5">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input type="email" placeholder="البريد الإلكتروني" className={inputStyle} />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input type="password" placeholder="كلمة المرور" className={inputStyle} />
                  </div>
                  <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold flex items-center justify-center gap-3 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all active:scale-95 mt-6">
                    فك القفل <ArrowRight size={18} />
                  </button>
                  <div className="flex flex-col gap-4 items-center mt-8">
                    <button onClick={() => setView('reset')} className="text-[11px] text-gray-500 hover:text-white transition-colors">هل فقدت مفتاح الدخول؟</button>
                    <div className="h-[1px] w-20 bg-white/10" />
                    <button onClick={() => setView('register')} className="text-xs text-violet-400 font-bold hover:text-violet-300">تأسيس منشأة تجارية جديدة</button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. واجهة إنشاء حساب */}
            {view === 'register' && (
              <motion.div key="reg" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold text-white text-center mb-8 text-emerald-400">تأسيس منشأة</h2>
                <div className="space-y-4">
                  <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} /><input type="text" placeholder="الاسم الكامل للتاجر" className={inputStyle} /></div>
                  <div className="relative"><Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} /><input type="text" placeholder="اسم المتجر العبري" className={inputStyle} /></div>
                  <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} /><input type="email" placeholder="البريد الإلكتروني الرسمي" className={inputStyle} /></div>
                  <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} /><input type="password" placeholder="كلمة المرور المشفرة" className={inputStyle} /></div>
                  <button className="w-full py-4 rounded-2xl bg-white text-black font-black mt-6 hover:bg-emerald-400 transition-colors active:scale-95">تفعيل البروتوكول ➔</button>
                  <button onClick={() => setView('login')} className="w-full text-[11px] text-gray-500 mt-6 text-center hover:text-white underline-offset-4 hover:underline">العودة للبوابة</button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
        <div className="flex justify-center items-center gap-4 mt-12">
            <div className="h-[1px] w-12 bg-gray-800" />
            <p className="text-[9px] text-gray-700 tracking-[0.5em] uppercase font-black">Titan Core Engine</p>
            <div className="h-[1px] w-12 bg-gray-800" />
        </div>
      </motion.div>
    </div>
  );
}
