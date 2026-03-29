'use client'
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function FinancialHealth({ tenantId }: { tenantId: string }) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from('platform_global_metrics')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();
      setStats(data);
    };
    fetchStats();
  }, [tenantId]);

  if (!stats) return <div className="animate-pulse bg-gray-100 h-32 rounded-xl" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">إجمالي المبيعات</p>
        <h3 className="text-2xl font-bold text-green-600">{stats.total_revenue} ج.م</h3>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">عدد الطلبات</p>
        <h3 className="text-2xl font-bold text-blue-600">{stats.total_orders} طلب</h3>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">متوسط قيمة الطلب</p>
        <h3 className="text-2xl font-bold text-purple-600">
          {stats.total_orders > 0 ? (stats.total_revenue / stats.total_orders).toFixed(2) : 0} ج.م
        </h3>
      </div>
    </div>
  );
}
