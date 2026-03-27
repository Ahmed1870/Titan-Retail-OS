'use client';

export default function FinancialHealth({ data }: { data: any }) {
  const isAlert = data.discrepancy > 0;

  return (
    <div className={`p-6 rounded-3xl border ${isAlert ? 'border-rose-500/50 bg-rose-500/5' : 'border-emerald-500/50 bg-emerald-500/5'}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-black text-sm uppercase tracking-widest">Financial Reconciliation</h3>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${isAlert ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {data.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Expected Sales</p>
          <p className="text-xl font-black text-white">{data.expected} EGP</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Actual Cash</p>
          <p className="text-xl font-black text-white">{data.actual} EGP</p>
        </div>
      </div>

      {isAlert && (
        <div className="mt-6 p-4 bg-rose-500/20 border border-rose-500/50 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold">!</div>
          <p className="text-xs text-rose-200 font-bold">
            Discrepancy detected: -{data.discrepancy} EGP missing from vault!
          </p>
        </div>
      )}
    </div>
  );
}
