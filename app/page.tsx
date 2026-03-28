'use client';
import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';

export default function LandingPage() {
  const { lang, t } = useLang();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-zinc-800 backdrop-blur-md sticky top-0 z-50">
        <div className="text-2xl font-black tracking-tighter text-blue-500">TITAN <span className="text-zinc-500 text-sm">OS</span></div>
        <div className="flex gap-4 items-center">
          <Link href="/auth/login" className="px-5 py-2 text-sm font-medium hover:text-blue-400 transition-colors">
            {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
          </Link>
          <Link href="/auth/register" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105">
            {lang === 'ar' ? 'ابدأ الآن مجاناً' : 'Get Started'}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 pt-20 pb-32 text-center">
        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
          {lang === 'ar' ? 'نظام إدارة التجزئة المتكامل' : 'The Ultimate Retail OS'}
        </h1>
        <p className="text-zinc-400 text-xl max-w-2xl mx-auto mb-12">
          {lang === 'ar' ? 'تحكم في متجرك، موظفيك، وعملائك من منصة واحدة ذكية.' : 'Control your store, staff, and customers from one intelligent platform.'}
        </p>
        <div className="flex flex-wrap justify-center gap-6">
           <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl w-64 backdrop-blur-sm">
              <h3 className="text-blue-500 font-bold mb-2">Multi-Tenant</h3>
              <p className="text-sm text-zinc-500">دعم كامل لتعدد المتاجر والشركات.</p>
           </div>
           <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl w-64 backdrop-blur-sm">
              <h3 className="text-blue-500 font-bold mb-2">Real-time</h3>
              <p className="text-sm text-zinc-500">متابعة المبيعات والمخزون لحظياً.</p>
           </div>
        </div>
      </main>

      {/* Footer with Personal Data */}
      <footer className="border-t border-zinc-800 py-12 px-8 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-left">
            <h4 className="font-bold text-zinc-300 mb-4">Contact Developer</h4>
            <div className="space-y-2">
              <a href="mailto:xcm3108@gmail.com" className="block text-zinc-500 hover:text-blue-400 transition-colors">xcm3108@gmail.com</a>
              <a href="https://wa.me/201019672878" target="_blank" className="block text-green-500 hover:underline font-medium">WhatsApp: 01019672878</a>
            </div>
          </div>
          <p className="text-zinc-600 text-sm">© 2026 Titan Retail OS. Built with Precision.</p>
        </div>
      </footer>
    </div>
  );
}
