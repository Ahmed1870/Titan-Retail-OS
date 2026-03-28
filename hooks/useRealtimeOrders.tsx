"use client";
'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Order } from '@/types';

export function useRealtimeOrders(tenantId: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!tenantId) return;
    const channel = supabase.channel(`orders_${tenantId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders', filter: `tenant_id=eq.${tenantId}` },
        (payload) => setOrders(prev => [payload.new as Order, ...prev]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `tenant_id=eq.${tenantId}` },
        (payload) => setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o)))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tenantId]);

  return orders;
}
