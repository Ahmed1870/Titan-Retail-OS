"use client";
'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useMerchantActivation(tenantId: string) {
  const [activated, setActivated] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!tenantId) return;
    const channel = supabase.channel(`tenant_activation_${tenantId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'tenants',
        filter: `id=eq.${tenantId}`,
      }, (payload) => {
        if (payload.new.plan_status === 'active') {
          setActivated(true);
          setPlan(payload.new.current_plan);
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tenantId]);

  return { activated, plan };
}
