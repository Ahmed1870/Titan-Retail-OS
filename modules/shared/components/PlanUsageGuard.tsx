'use client';

export default function PlanUsageGuard({ current, limit, label }: { current: number, limit: number, label: string }) {
  const usagePercent = (current / limit) * 100;
  const isCritical = usagePercent >= 90;

  if (usagePercent < 70) return null;

  return (
    <div className={`p-4 rounded-xl border ${isCritical ? 'bg-rose-500/10 border-rose-500/20' : 'bg-amber-500/10 border-amber-500/20'} mb-6`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-slate-300 uppercase">{label} Usage</span>
        <span className={`text-xs font-black ${isCritical ? 'text-rose-500' : 'text-amber-500'}`}>
          {current} / {limit}
        </span>
      </div>
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${isCritical ? 'bg-rose-500' : 'bg-amber-500'}`}
          style={{ width: `${usagePercent}%` }}
        />
      </div>
      {isCritical && (
        <p className="text-[10px] text-rose-400 mt-2 font-bold animate-pulse text-center">
          ⚠️ Limit almost reached! Upgrade to avoid service interruption.
        </p>
      )}
    </div>
  );
}
