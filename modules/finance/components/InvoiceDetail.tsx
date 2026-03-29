"use client";
'use client';

export default function InvoiceDetail({ transaction }: { transaction: any }) {
  return (
    <div className="bg-[#0f171a] border border-slate-800 p-8 rounded-3xl max-w-md mx-auto shadow-2xl">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-white font-black text-xl uppercase tracking-tighter">TITAN RETAIL</h2>
          <p className="text-[10px] text-slate-500 font-mono">INV-TX-{transaction.id.substring(0,6)}</p>
        </div>
        <div className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
          transaction.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
        }`}>
          {transaction.type}
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span className="text-slate-500 text-xs">Date</span>
          <span className="text-white text-xs font-mono">{new Date(transaction.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span className="text-slate-500 text-xs">Description</span>
          <span className="text-white text-xs">{transaction.description || 'System Service Fee'}</span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-slate-500 text-[10px] uppercase font-black mb-1">Total Amount</p>
        <h1 className="text-4xl font-black text-white">{Math.abs(transaction.amount)} <span className="text-sm font-normal text-slate-500">EGP</span></h1>
      </div>

      <button className="w-full mt-8 bg-white text-black py-3 rounded-xl font-black text-xs hover:bg-slate-200 transition-colors uppercase">
        Download PDF (SOON)
      </button>
    </div>
  );
}
