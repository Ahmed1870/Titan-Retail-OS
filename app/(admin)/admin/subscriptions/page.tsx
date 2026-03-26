'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SubscriptionManager() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // 1. Initial Load from Schema v2.0
    const fetchRequests = async () => {
      const { data } = await supabase
        .from('subscription_requests')
        .select('*, tenants(store_name, phone)')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });
      setRequests(data || []);
      setLoading(false);
    };
    fetchRequests();

    // 2. Realtime Listener (من ملفك القديم)
    const channel = supabase
      .channel('admin_sub_alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'subscription_requests' }, 
      (payload) => {
        setRequests(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleAction = async (id: string, tenantId: string, plan: string, action: 'APPROVED' | 'REJECTED') => {
    // نداء الـ API الموحد اللي بيحدث الـ Tenant والـ Subscription مع بعض
    const res = await fetch(`/api/admin/subscriptions/${id}/${action.toLowerCase()}`, {
      method: 'POST',
      body: JSON.stringify({ tenantId, plan })
    });
    
    if (res.ok) {
      setRequests(prev => prev.filter(r => r.id !== id));
      alert(`Action ${action} successful`);
    }
  };

  if (loading) return <div className="animate-pulse text-[#00ff88]">INITIALIZING_TITAN_PROTOCOL...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-[#00ff88]/20 pb-4">
        <h2 className="text-2xl font-black italic underline decoration-wavy">PENDING_REQUESTS</h2>
        <span className="bg-[#00ff88] text-black px-2 py-1 text-xs font-bold">{requests.length} NEW</span>
      </div>

      <div className="grid gap-4">
        {requests.map(req => (
          <div key={req.id} className="bg-[#0a0a0a] border border-[#00ff88]/30 p-6 flex justify-between items-center group hover:border-[#00ff88] transition-all">
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-[#00ff88]">{req.tenants?.store_name}</h3>
              <p className="text-xs font-mono text-gray-500">PLAN: {req.plan} | METHOD: {req.payment_method}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleAction(req.id, req.tenant_id, req.plan, 'APPROVED')} className="bg-[#00ff88] text-black px-6 py-2 text-xs font-black hover:bg-white transition">APPROVE</button>
              <button onClick={() => handleAction(req.id, req.tenant_id, req.plan, 'REJECTED')} className="border border-red-500 text-red-500 px-6 py-2 text-xs font-black hover:bg-red-500 hover:text-white transition">REJECT</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
