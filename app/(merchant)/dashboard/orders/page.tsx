'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function MerchantOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: tenant } = await supabase.from('tenants').select('id').eq('owner_id', user?.id).single();
      const { data } = await supabase.from('orders').select('*').eq('tenant_id', tenant?.id).order('created_at', { ascending: false });
      setOrders(data || []);

      // تفعيل السماع اللحظي للأوردرات الجديدة
      supabase.channel('new-orders')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders', filter: `tenant_id=eq.${tenant?.id}` }, 
        payload => setOrders(prev => [payload.new, ...prev]))
        .subscribe();
    };
    fetchOrders();
  }, []);

  return (
    <div className="p-8 bg-[#080c14] min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">الطلبات الواردة</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-gray-400">
              <th className="p-4">رقم الطلب</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">الإجمالي</th>
              <th className="p-4">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 font-mono text-sm">{order.id.slice(0,8)}</td>
                <td className="p-4 text-yellow-400">{order.status}</td>
                <td className="p-4 font-bold">{order.total_amount} EGP</td>
                <td className="p-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
