'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    dashboard: "لوحة التحكم",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
    welcome: "مرحباً بك في تيتان",
    merchants: "التجار",
    orders: "الطلبات",
    save: "حفظ التغييرات"
  },
  en: {
    dashboard: "Dashboard",
    settings: "Settings",
    logout: "Logout",
    welcome: "Welcome to Titan",
    merchants: "Merchants",
    orders: "Orders",
    save: "Save Changes"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('ar');

  useEffect(() => {
    const saved = localStorage.getItem('titan_lang') as Language;
    if (saved) setLang(saved);
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('titan_lang', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const t = (key: string) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={lang === 'ar' ? 'font-arabic' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export const useLang = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLang must be used within LanguageProvider');
  return context;
};
