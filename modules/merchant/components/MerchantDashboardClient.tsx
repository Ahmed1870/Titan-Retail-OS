'use client';
import StatsOverview from '@/modules/analytics/components/StatsOverview';

export default function MerchantDashboardClient({ tenantId, storeName, initialStats }: any) {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Dashboard</h1>
          <p className="text-slate-400 font-medium">Welcome back, <span className="text-emerald-500">{storeName}</span></p>
        </div>
        <div className="flex gap-2">
          <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold border border-slate-700">Settings</button>
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-emerald-900/20">Add Product +</button>
        </div>
      </header>

      {/* عرض خُرطوم الإحصائيات */}
      <StatsOverview summary={initialStats?.summary || { totalSales: 0, totalOrders: 0, totalProfit: 0 }} />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#0f172a] border border-slate-800 rounded-3xl p-6 min-h-[300px]">
          <h3 className="text-white font-bold mb-4">Sales Performance</h3>
          <div className="flex items-center justify-center h-full text-slate-600 italic">
            Chart engine initializing...
          </div>
        </div>
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6">
          <h3 className="text-white font-bold mb-4">Recent Activity</h3>
          <p className="text-sm text-slate-500">Live feed from the Logistics Pipe...</p>
        </div>
      </section>
    </div>
  );
}
