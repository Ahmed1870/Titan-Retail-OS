'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function CourierDashboard() {
  const [deliveries, setDeliveries] = useState<any[]>([]);

  useEffect(() => {
    const fetchDeliveries = async () => {
      const { data } = await supabase.from('orders').select('*, tenants(store_name)').eq('status', 'READY_FOR_PICKUP');
      setDeliveries(data || []);
    };
    fetchDeliveries();
  }, []);

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <h1 className="text-2xl font-black mb-6">Titan Courier - المندوب</h1>
      <div className="grid gap-4">
        {deliveries.map(d => (
          <div key={d.id} className="bg-white p-5 rounded-2xl shadow-md border-l-8 border-yellow-400">
            <p className="font-bold text-lg">{d.tenants.store_name}</p>
            <p className="text-sm text-gray-500">Address: {d.customer_info?.address}</p>
            <button className="mt-4 bg-black text-white w-full py-2 rounded-lg">تأكيد الاستلام</button>
          </div>
        ))}
      </div>
    </div>
  );
}
