'use client';
import { usePlanAccess } from '@/modules/auth/hooks/usePlanAccess';

export default function MerchantSidebar({ currentPlan }: { currentPlan: any }) {
  const { canAccessAnalytics } = usePlanAccess(currentPlan);

  return (
    <nav className="space-y-2 p-4">
      <a href="/merchant/dashboard" className="block p-3 rounded-xl bg-emerald-600 text-white font-bold text-sm">
        🏠 Overview
      </a>
      
      <a href="/merchant/inventory" className="block p-3 rounded-xl text-slate-400 hover:bg-slate-800 font-bold text-sm">
        📦 Inventory
      </a>

      {/* ميزة محمية بالباقة */}
      <div className={!canAccessAnalytics ? 'opacity-50' : ''}>
        <a 
          href={canAccessAnalytics ? "/merchant/analytics" : "#"} 
          className={`flex items-center justify-between p-3 rounded-xl text-slate-400 font-bold text-sm ${canAccessAnalytics ? 'hover:bg-slate-800' : 'cursor-not-allowed'}`}
        >
          📊 Analytics
          {!canAccessAnalytics && <span className="text-[9px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded">PRO</span>}
        </a>
      </div>
      
      <a href="/merchant/staff" className="block p-3 rounded-xl text-slate-400 hover:bg-slate-800 font-bold text-sm">
        👥 Staff Management
      </a>
    </nav>
  );
}
