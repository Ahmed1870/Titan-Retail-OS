"use client";
'use client';
import { useLang } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';

export default function LangSwitcher() {
  const { lang, toggleLang } = useLang();
  return (
    <button 
      onClick={toggleLang}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-medium text-violet-400"
    >
      <Globe size={14} />
      {lang === 'ar' ? 'English' : 'العربية'}
    </button>
  );
}
