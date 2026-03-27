'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, Globe, ArrowRight, Zap, Shield, Users } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const isAr = lang === 'ar';

  const content = {
    ar: {
      hero: "تيتان: نظام إدارة التجزئة المتكامل",
      sub: "أدر متجرك، مناديبك، وعملائك في منصة واحدة ذكية.",
      cta: "ابدأ الآن مجاناً",
      whatsapp: "تواصل واتساب",
      email: "راسلنا بريدياً",
      features: "مميزات المنصة",
      referral: "نظام الإحالة الذكي"
    },
    en: {
      hero: "Titan: Ultimate Retail OS",
      sub: "Manage your store, couriers, and customers in one smart platform.",
      cta: "Start Free Now",
      whatsapp: "WhatsApp Us",
      email: "Email Support",
      features: "Platform Features",
      referral: "Smart Referral System"
    }
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-[#080c14] text-white overflow-x-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-black bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">TITAN OS</div>
        <button onClick={() => setLang(isAr ? 'en' : 'ar')} className="bg-white/5 px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-all">
          <Globe size={18} /> {isAr ? 'English' : 'العربية'}
        </button>
      </nav>

      {/* Hero */}
      <section className="py-20 px-6 text-center">
        <motion.h1 initial={{y:30, opacity:0}} animate={{y:0, opacity:1}} className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          {t.hero}
        </motion.h1>
        <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}} className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          {t.sub}
        </motion.p>
        <Link href="/auth/register">
          <motion.button whileHover={{scale:1.05}} className="bg-gradient-to-r from-violet-600 to-indigo-600 px-10 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-violet-500/20">
            {t.cta}
          </motion.button>
        </Link>
      </section>

      {/* Contact Footer */}
      <footer className="py-20 border-t border-white/5 bg-black/20">
        <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-6">
          <a href="https://wa.me/201019672878" className="bg-[#25D366]/10 p-8 rounded-3xl border border-[#25D366]/20 flex flex-col items-center gap-4 hover:bg-[#25D366]/20 transition-all group">
            <MessageCircle size={40} className="text-[#25D366] group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xl">{t.whatsapp}</span>
            <span className="text-gray-400 text-sm">01019672878</span>
          </a>
          <a href="mailto:xcm3108@gmail.com" className="bg-violet-500/10 p-8 rounded-3xl border border-violet-500/20 flex flex-col items-center gap-4 hover:bg-violet-500/20 transition-all group">
            <Mail size={40} className="text-violet-400 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xl">{t.email}</span>
            <span className="text-gray-400 text-sm">xcm3108</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
