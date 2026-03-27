'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Zap, BarChart3, Users, MessageCircle, Mail, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const contact = { whatsapp: "201019672878", email: "xcm3108" };

  return (
    <div className="min-h-screen bg-[#05070a] text-white selection:bg-violet-500/30 overflow-x-hidden" dir="rtl">
      {/* Navbar المينيمالست */}
      <nav className="flex justify-between items-center p-8 max-w-7xl mx-auto backdrop-blur-md sticky top-0 z-50">
        <div className="text-3xl font-black tracking-tighter">TITAN<span className="text-violet-500">OS</span></div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">المميزات</a>
          <a href="#contact" className="hover:text-white transition-colors">التواصل</a>
        </div>
        <Link href="/auth" className="bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-violet-600/20 hover:scale-105 transition-all">
          دخول الحصن
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto pt-24 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">نظام إدارة التجزئة v4.0</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight">
            أدر مملكـتـك <br/> بذكاء <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-500">تـايـتـان</span>
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
            المنصة العربية الأولى لإدارة المخازن، المناديب، والتحصيلات النقدية بدقة متناهية وأمان مطلق.
          </p>
          
          <div className="flex flex-col md:flex-row gap-5 justify-center items-center">
            <Link href="/auth?view=register" className="w-full md:w-auto bg-white text-black px-10 py-5 rounded-2xl font-black text-lg hover:bg-violet-500 hover:text-white transition-all duration-500 flex items-center justify-center gap-3">
              ابدأ الآن مجاناً <ArrowRight size={20} />
            </Link>
            <a href={`https://wa.me/${contact.whatsapp}`} className="w-full md:w-auto bg-white/5 border border-white/10 px-10 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
              <MessageCircle size={20} className="text-green-500" /> تحدث مع الدعم
            </a>
          </div>
        </motion.div>

        {/* Features Preview */}
        <div id="features" className="grid md:grid-cols-3 gap-8 mt-40 pb-20">
           {[
             { title: "نقطة بيع سحابية", desc: "بيع وفوترة ومسح باركود لحظي من موبايلك.", icon: Zap },
             { title: "رقابة المخزون", desc: "تنبيهات ذكية للنواقص وحركة الأصناف بدقة.", icon: BarChart3 },
             { title: "تتبع المناديب", desc: "راقب خطوط السير والتحصيلات في قمرة قيادة واحدة.", icon: Users }
           ].map((f, i) => (
             <div key={i} className="group p-10 rounded-[40px] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.05] text-right hover:border-violet-500/50 transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-violet-600/10 flex items-center justify-center mb-6 group-hover:bg-violet-600 group-hover:text-white transition-all">
                  <f.icon size={28} className="text-violet-500 group-hover:text-white" />
                </div>
                <h3 className="font-black text-2xl mb-4 text-white">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{f.desc}</p>
             </div>
           ))}
        </div>

        {/* Contact Section */}
        <footer id="contact" className="mt-20 border-t border-white/5 py-20">
           <div className="flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="text-right">
                <h4 className="text-2xl font-black mb-2">تواصل مع تايتان</h4>
                <p className="text-gray-500 text-sm italic">نحن هنا لخدمة توسع تجارتك</p>
              </div>
              <div className="flex flex-wrap gap-6 justify-center">
                 <div className="flex items-center gap-3 bg-white/2 px-6 py-4 rounded-2xl border border-white/5">
                    <Mail size={20} className="text-violet-500" />
                    <span className="text-sm font-mono text-gray-300">{contact.email}</span>
                 </div>
                 <div className="flex items-center gap-3 bg-white/2 px-6 py-4 rounded-2xl border border-white/5">
                    <MessageCircle size={20} className="text-green-500" />
                    <span className="text-sm font-mono text-gray-300">+{contact.whatsapp}</span>
                 </div>
              </div>
           </div>
           <p className="text-[10px] text-gray-700 mt-20 tracking-[0.5em] uppercase font-bold">
             Titan Retail Operating System © 2026
           </p>
        </footer>
      </main>
    </div>
  );
}
