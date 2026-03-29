'use client'
export default function ShiftManager({ currentCash }: { currentCash: number }) {
  return (
    <div className="p-6 bg-[#0f171a] border border-slate-800 rounded-3xl">
      <h3 className="text-white font-black text-xs uppercase mb-4">End of Day / Shift</h3>
      <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-white/5">
        <span className="text-slate-500 text-xs">Current Cash in Vault</span>
        <span className="text-xl font-black text-emerald-500">{currentCash} EGP</span>
      </div>
      <button className="w-full mt-4 py-3 bg-rose-600 text-white font-black rounded-xl hover:bg-rose-500 transition-all">
        CLOSE SHIFT & GENERATE Z-REPORT
      </button>
    </div>
  );
}
