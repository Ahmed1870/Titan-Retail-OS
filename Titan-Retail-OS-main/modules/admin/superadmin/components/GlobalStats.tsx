"use client";
'use client';

export default function GlobalStats({ metrics }: any) {
  const cards = [
    { label: 'Total Merchants', value: metrics.total_merchants, color: 'text-blue-400' },
    { label: 'System Earnings', value: `${metrics.total_platform_earnings || 0} EGP`, color: 'text-emerald-400' },
    { label: 'Successful Orders', value: metrics.total_successful_orders, color: 'text-indigo-400' },
    { label: 'Users Base', value: metrics.total_users, color: 'text-rose-400' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
      {cards.map((card, i) => (
        <div key={i} className="bg-[#0f171a] border border-slate-800 p-6 rounded-3xl">
          <p className="text-[10px] uppercase font-black text-slate-500 tracking-tighter mb-1">{card.label}</p>
          <h2 className={`text-2xl font-black ${card.color}`}>{card.value}</h2>
        </div>
      ))}
    </div>
  );
}
