'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function ReportsPage() {
  const [stats, setStats] = useState({ total_sales: 0, total_orders: 0 });

  useEffect(() => {
    async function loadStats() {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: tenant } = await supabase.from('tenants').select('id').eq('owner_id', user?.id).single();
      const { data: orders } = await supabase.from('orders').select('total_amount').eq('tenant_id', tenant?.id);
      
      const total = orders?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;
      setStats({ total_sales: total, total_orders: orders?.length || 0 });
    }
    loadStats();
  }, []);

  return (
    <div className="p-8 bg-[#080c14] min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-10 text-purple-400">تحليلات المتجر</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/5 p-10 rounded-3xl border border-white/10">
          <p className="text-gray-400 mb-2">إجمالي المبيعات</p>
          <h2 className="text-5xl font-black">{stats.total_sales} <span className="text-sm">EGP</span></h2>
        </div>
        <div className="bg-white/5 p-10 rounded-3xl border border-white/10">
          <p className="text-gray-400 mb-2">عدد الطلبات</p>
          <h2 className="text-5xl font-black">{stats.total_orders}</h2>
        </div>
      </div>
    </div>
  );
}
