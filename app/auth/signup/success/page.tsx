'use client';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';

export default function SignUpSuccess() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
      <div className="max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-12 rounded-[2rem] shadow-2xl">
        <div className="w-20 h-20 bg-blue-600/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <MailCheck className="w-10 h-10 text-blue-500" />
        </div>
        <h1 className="text-3xl font-black text-white mb-4">تفقد بريدك!</h1>
        <p className="text-zinc-400 mb-10">أرسلنا رابط تفعيل لبريدك الإلكتروني. اضغط عليه لتفعيل متجرك في TITAN.</p>
        <Link href="/auth/login" className="block w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all">
          العودة لتسجيل الدخول
        </Link>
      </div>
    </div>
  );
}
