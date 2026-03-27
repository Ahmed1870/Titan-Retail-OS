import ThemeHandler from '@/modules/store/components/ThemeHandler';

export default function StoreLayout({ children, storeData }: any) {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      {/* حقن الهوية البصرية بناءً على الباقة */}
      <ThemeHandler primaryColor={storeData.primaryColor} />
      
      <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-md border-b border-white/5 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-black tracking-tighter text-white uppercase">
            {storeData.title}
          </h1>
          <div className="relative">
            {/* أيقونة السلة ستوضع هنا */}
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {children}
      </main>

      <footer className="mt-20 border-t border-white/5 p-8 text-center text-slate-600 text-xs">
        <p>Proudly powered by <span className="text-white font-bold tracking-widest">TITAN-RETAIL OS</span></p>
      </div>
    </div>
  );
}
