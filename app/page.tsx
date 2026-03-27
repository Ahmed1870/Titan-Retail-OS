'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, Globe, Zap, Shield, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const isAr = lang === 'ar';

  const content = {
    ar: {
      hero: "تيتان OS: نظام إدارة التجزئة المتكامل",
      sub: "أدر متجرك، مناديبك، وعملائك من منصة واحدة ذكية. الحل الأمثل للنمو والكفاءة.",
      cta: "ابدأ تجربتك المجانية",
      features: "لماذا تيتان؟",
      f1: "إدارة مخزون ذكية", f1d: "تتبع دقيق للمنتجات والمخازن لحظياً.",
      f2: "تتبع المناديب", f2d: "إدارة خطوط السير وتحصيل النقدية بكفاءة.",
      f3: "تقارير مفصلة", f3d: "تحليلات عميقة للأداء والمبيعات لاتخاذ قرارات أفضل.",
      whatsapp: "تواصل معنا عبر واتساب",
      email: "الدعم الفني عبر البريد"
    },
    en: {
      hero: "Titan OS: Ultimate Retail Management",
      sub: "Manage your store, couriers, and customers from one smart platform. Built for growth.",
      cta: "Start Free Trial",
      features: "Why Titan?",
      f1: "Smart Inventory", f1d: "Real-time product and warehouse tracking.",
      f2: "Courier Tracking", f2d: "Efficient route and cash collection management.",
      f3: "Detailed Analytics", f3d: "Deep insights into sales performance.",
      whatsapp: "Chat on WhatsApp",
      email: "Email Support"
    }
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-[#080c14] text-white overflow-x-hidden font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5">
        <div className="text-3xl font-black bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">TITAN OS</div>
        <div className="flex items-center gap-4">
          <button onClick={() => setLang(isAr ? 'en' : 'ar')} className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-all text-sm">
            <Globe size={16} /> {isAr ? 'English' : 'العربية'}
          </button>
          <Link href="/auth/login" className="text-sm text-gray-400 hover:text-white">تسجيل الدخول</Link>
        </div>
      </nav>

      <section className="py-24 px-6 text-center bg-[url('/grid.svg')] bg-center">
        <motion.h1 initial={{y:40, opacity:0}} animate={{y:0, opacity:1}} transition={{duration:0.6}} className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
          {t.hero}
        </motion.h1>
        <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3}} className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
          {t.sub}
        </motion.p>
        <Link href="/auth/register">
          <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} className="bg-gradient-to-r from-violet-600 to-indigo-600 px-12 py-5 rounded-2xl font-bold text-lg shadow-lg shadow-violet-500/20 flex items-center gap-3 mx-auto">
            {t.cta} <Zap size={20}/>
          </motion.button>
        </Link>
      </section>

      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center mb-16">{t.features}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[ {icon: Zap, title: t.f1, desc: t.f1d}, {icon: Users, title: t.f2, desc: t.f2d}, {icon: BarChart3, title: t.f3, desc: t.f3d} ].map((feat, i) => (
            <motion.div key={i} initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} transition={{delay: i*0.2}} className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-violet-500/50 transition-all group">
              <feat.icon className="w-12 h-12 text-violet-400 mb-6 group-hover:scale-110 transition-transform"/>
              <h3 className="text-2xl font-bold mb-3">{feat.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="py-16 border-t border-white/5 bg-black/20 mt-20">
        <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-6">
          <a href="https://wa.me/201019672878" className="bg-[#25D366]/10 p-8 rounded-3xl border border-[#25D366]/20 flex flex-col items-center gap-4 hover:bg-[#25D366]/20 transition-all group text-center">
            <MessageCircle size={40} className="text-[#25D366] group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xl">{t.whatsapp}</span>
          </a>
          <a href="mailto:xcm3108@gmail.com" className="bg-violet-500/10 p-8 rounded-3xl border border-violet-500/20 flex flex-col items-center gap-4 hover:bg-violet-500/20 transition-all group text-center">
            <Mail size={40} className="text-violet-400 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xl">{t.email}</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
