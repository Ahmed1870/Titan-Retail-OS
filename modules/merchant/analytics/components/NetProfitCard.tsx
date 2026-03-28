"use client";
export default function NetProfitCard({ netProfit }: { netProfit: number }) {
  return (
    <div className="bg-gradient-to-br from-emerald-900/20 to-slate-900 border border-emerald-500/30 p-6 rounded-3xl">
      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Net Profit (Post-Fees)</p>
      <h2 className="text-3xl font-black text-white">{netProfit.toLocaleString()} EGP</h2>
      <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        Live calculation includes commissions and expenses.
      </div>
    </div>
  );
}
