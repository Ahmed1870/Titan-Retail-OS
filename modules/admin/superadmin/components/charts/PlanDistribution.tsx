'use client';

export default function PlanDistribution({ distribution }: { distribution: Record<string, number> }) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  
  return (
    <div className="bg-[#0f171a] border border-slate-800 p-6 rounded-3xl h-full">
      <h3 className="text-white font-bold text-sm mb-6 uppercase tracking-widest">Plan Distribution</h3>
      <div className="space-y-4">
        {Object.entries(distribution).map(([plan, count]) => {
          const percent = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={plan}>
              <div className="flex justify-between text-[10px] mb-1 uppercase font-black">
                <span className="text-slate-400">{plan}</span>
                <span className="text-white">{count} ({percent.toFixed(1)}%)</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    plan === 'enterprise' ? 'bg-indigo-500' : 
                    plan === 'pro' ? 'bg-emerald-500' : 'bg-slate-500'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
