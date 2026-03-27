import React from 'react';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30">
      <nav className="border-b border-white/5 p-4 flex justify-between items-center backdrop-blur-md sticky top-0 z-50">
        <div className="font-black tracking-tighter text-xl">TITAN<span className="text-emerald-500">STORE</span></div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="mt-20 border-t border-white/5 p-8 text-center text-slate-600 text-xs font-medium uppercase tracking-widest">
        &copy; 2026 Titan-Retail OS. All Rights Reserved.
      </footer>
    </div>
  );
}
