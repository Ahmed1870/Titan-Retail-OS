"use client";
export default function StatsOverview({ summary }: { summary: any }) {
  const cards = [
    { label: 'Total Sales', value: `${summary.totalSales} EGP`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Orders', value: summary.totalOrders, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Net Profit', value: `${summary.totalProfit.toFixed(2)} EGP`, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {cards.map((card, i) => (
        <div key={i} className={`${card.bg} border border-white/5 p-6 rounded-2xl shadow-sm transition-all hover:border-white/10`}>
          <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">{card.label}</p>
          <h3 className={`text-2xl font-black ${card.color}`}>{card.value}</h3>
        </div>
      ))}
    </div>
  );
}
