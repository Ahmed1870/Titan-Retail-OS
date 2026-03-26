'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: tenant } = await supabase.from('tenants').select('id').eq('owner_id', user?.id).single();
      const { data } = await supabase.from('inventory').select('*, products(name)').eq('tenant_id', tenant?.id);
      setItems(data || []);
    };
    load();
  }, []);

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-8">مراقبة المخزون</h1>
      <div className="grid gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center">
            <span>{item.products.name}</span>
            <div className="flex items-center gap-4">
              <span className={item.quantity < 5 ? 'text-red-500' : 'text-green-500'}>
                {item.quantity} قطعة
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
