import React from 'react';

export default function LandingPage() {
  return (
    <div className="bg-[#05070a] text-white min-h-screen font-sans selection:bg-purple-500 selection:text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-6 border-b border-white/5 backdrop-blur-md sticky top-0 z-[100]">
        <div className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
          TITAN OS
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <a href="/docs" className="hover:text-white transition">Developers</a>
        </div>
        <div className="flex gap-4">
          <a href="/login" className="px-5 py-2 text-sm font-bold hover:text-purple-400 transition">Login</a>
          <a href="/register" className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-purple-500 hover:text-white transition-all">
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-32 px-6 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full -z-10"></div>
        
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 mb-6 border border-purple-500/30 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold tracking-widest uppercase">
            v3.0.0 is now live
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
            Empower Your Store <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
              Beyond Limits.
            </span>
          </h1>
          <p className="text-gray-400 text-xl md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed">
            The next-generation retail operating system. Built for speed, scale, and seamless merchant management.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <a href="/register" className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-[0_0_40px_rgba(147,51,234,0.3)]">
              Launch Your Business
            </a>
            <button className="w-full md:w-auto bg-white/5 hover:bg-white/10 border border-white/10 px-10 py-5 rounded-2xl font-bold text-lg backdrop-blur-xl transition">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Dashboard Preview Overlay */}
        <div className="mt-24 max-w-6xl mx-auto border border-white/10 rounded-3xl bg-white/5 p-4 backdrop-blur-3xl shadow-2xl relative">
            <div className="bg-[#080c14] rounded-2xl h-[500px] overflow-hidden border border-white/5 flex">
                <div className="w-64 border-r border-white/5 p-6 hidden md:block">
                    <div className="h-4 w-32 bg-white/10 rounded mb-10"></div>
                    {[1,2,3,4].map(i => <div key={i} className="h-3 w-full bg-white/5 rounded mb-4"></div>)}
                </div>
                <div className="flex-1 p-10">
                    <div className="flex justify-between mb-10">
                        <div className="h-8 w-48 bg-white/10 rounded"></div>
                        <div className="h-8 w-24 bg-purple-500/20 rounded"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        {[1,2,3].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl border border-white/5"></div>)}
                    </div>
                </div>
            </div>
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-transparent"></div>
        </div>
      </header>

      {/* Trust Badges */}
      <section className="py-20 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-sm font-bold text-gray-600 uppercase tracking-widest mb-10">Trusted by modern vendors in Fayoum & Cairo</p>
            <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale">
                <div className="text-2xl font-bold italic">RetailPro</div>
                <div className="text-2xl font-bold italic">MerchantX</div>
                <div className="text-2xl font-bold italic">FastCart</div>
                <div className="text-2xl font-bold italic">StockSync</div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-10 border-t border-white/5 text-center">
          <p className="text-gray-600 text-sm">© 2026 TITAN OS. Built with precision for the next generation of commerce.</p>
      </footer>
    </div>
  );
}
