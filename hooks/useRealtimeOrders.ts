'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order } from '@/lib/types'

export const useRealtimeOrders = (tenantId: string) => {
  const [orders, setOrders] = useState<Order[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (!tenantId) return

    const channel = supabase
      .channel('live_orders')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'orders', filter: `tenant_id=eq.${tenantId}` },
        (payload) => setOrders(prev => [payload.new as Order, ...prev])
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tenantId])

  return orders
}
