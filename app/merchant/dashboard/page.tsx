'use client'
import { Suspense } from 'react';
import GlobalStats from '@/modules/admin/superadmin/components/GlobalStats';
import MerchantTable from '@/modules/admin/superadmin/components/MerchantTable';
import TableSkeleton from '@/modules/shared/components/skeletons/TableSkeleton';
import { getGlobalMetricsAction, getAllTenantsAction } from '@/modules/admin/superadmin/actions/monitor';

export default async function AdminDashboardPage() {
  // جلب البيانات الأساسية بسرعة
  const metricsData = getGlobalMetricsAction();
  const tenantsData = getAllTenantsAction();

  return (
    <div className="p-8 space-y-10">
      <header>
        <h1 className="text-3xl font-black text-white tracking-tighter">COMMAND CENTER</h1>
        <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">Real-time Platform Monitor</p>
      </header>

      {/* الجزء الأول: الإحصائيات (تحميل سريع) */}
      <Suspense fallback={<div className="h-32 bg-slate-800/20 animate-pulse rounded-3xl" />}>
        <StatsWrapper promise={metricsData} />
      </Suspense>

      {/* الجزء الثاني: الجدول (بيانات ضخمة - تحميل كسول) */}
      <div>
        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Active Merchants
        </h2>
        <Suspense fallback={<TableSkeleton />}>
          <TableWrapper promise={tenantsData} />
        </Suspense>
      </div>
    </div>
  );
}

// مكونات وسيطة (Wrappers) للتعامل مع الـ Promises
async function StatsWrapper({ promise }: { promise: Promise<any> }) {
  const { data } = await promise;
  return <GlobalStats metrics={data} />;
}

async function TableWrapper({ promise }: { promise: Promise<any> }) {
  const { data } = await promise;
  return <MerchantTable tenants={data} />;
}
