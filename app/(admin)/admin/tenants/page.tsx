'use client';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
      setTenants(data || []);
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic">Active_Tenants</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tenants.map(t => (
          <div key={t.id} className="p-4 border border-[#00ff88]/20 bg-[#080808] glass-effect relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 bg-[#00ff88]/10 text-[10px]">{t.current_plan}</div>
            <h3 className="font-black text-white">{t.store_name}</h3>
            <p className="text-xs text-[#00ff88]/60">ID: {t.id}</p>
            <p className="text-xs text-gray-500 mt-2">Verified: {t.is_verified ? 'YES' : 'NO'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
