'use client';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AdminSubs() {
  const [requests, setRequests] = useState<any[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('subscription_requests').select('*, tenants(store_name)').eq('status', 'PENDING');
      setRequests(data || []);
    };
    fetch();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    await fetch(`/api/admin/subscriptions/${id}/${action}`, { method: 'POST' });
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic">Pending_Upgrades</h2>
      <div className="border border-[#00ff88]/20 bg-[#0a0a0a]">
        {requests.map(req => (
          <div key={req.id} className="p-4 border-b border-[#00ff88]/10 flex justify-between items-center">
            <div>
              <p className="font-bold">{req.tenants.store_name} -> {req.plan}</p>
              <p className="text-xs text-gray-500">{req.phone_number} | {req.payment_method}</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => handleAction(req.id, 'approve')} className="px-4 py-1 bg-[#00ff88] text-black text-xs font-bold uppercase italic hover:bg-white transition">Approve</button>
              <button onClick={() => handleAction(req.id, 'reject')} className="px-4 py-1 border border-red-500 text-red-500 text-xs font-bold uppercase italic hover:bg-red-500 hover:text-white transition">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
