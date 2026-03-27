'use client';
import React from 'react';

interface FeatureGateProps {
  hasAccess: boolean;
  children: React.ReactNode;
  featureName: string;
}

export default function FeatureGate({ hasAccess, children, featureName }: FeatureGateProps) {
  if (hasAccess) return <>{children}</>;

  return (
    <div className="relative group cursor-not-allowed">
      {/* طبقة التغطية الضبابية */}
      <div className="filter blur-[4px] pointer-events-none select-none">
        {children}
      </div>
      
      {/* رسالة الترقية الوسطية */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 rounded-2xl border border-dashed border-amber-500/30">
        <div className="bg-amber-500 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded mb-2 uppercase">
          Pro Feature
        </div>
        <p className="text-white text-xs font-bold px-4 text-center">
          Upgrade to PRO to unlock {featureName}
        </p>
        <button className="mt-3 bg-white text-black text-[10px] font-black px-4 py-2 rounded-lg hover:scale-105 transition-transform">
          UPGRADE NOW 🚀
        </button>
      </div>
    </div>
  );
}
