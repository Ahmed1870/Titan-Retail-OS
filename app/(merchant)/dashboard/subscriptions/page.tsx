'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function MerchantSubPage() {
  const [plans] = useState([
    { id: 'starter', name: 'Starter', price: 299 },
    { id: 'pro', name: 'Professional', price: 599 },
    { id: 'enterprise', name: 'Enterprise', price: 1299 }
  ]);
  const [loading, setLoading] = useState(false);
  const [tenant, setTenant] = useState<any>(null);

  useEffect(() => {
    const getTenant = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('tenants').select('*').eq('owner_id', user?.id).single();
      setTenant(data);
    };
    getTenant();
  }, []);

  const handleSubscribe = async (planId: string) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const res = await fetch('/api/merchant/subscriptions/request', {
      method: 'POST',
      body: JSON.stringify({
        tenant_id: tenant.id,
        plan: planId,
        payment_method: 'vodafone_cash',
        full_name: user?.email?.split('@')[0],
        phone_number: '010XXXXXXXX'
      })
    });
    if (res.ok) alert("✅ تم إرسال الطلب للأدمن!");
    setLoading(false);
  };

  return (
    <div className="p-8 text-white bg-[#080c14] min-h-screen">
      <h1 className="text-3xl font-black mb-8">Upgrade Your Titan OS</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-purple-500 transition">
            <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
            <p className="text-4xl font-black mb-6">{plan.price} EGP</p>
            <button onClick={() => handleSubscribe(plan.id)} disabled={loading} className="w-full bg-purple-600 py-3 rounded-xl font-bold">
              {loading ? 'جاري الطلب...' : 'اشترك الآن'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
