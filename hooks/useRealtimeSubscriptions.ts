import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export const useRealtimeSubscriptions = () => {
  const [requests, setRequests] = useState<any[]>([]);
  useEffect(() => {
    const channel = supabase.channel('realtime-subs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscription_requests' }, 
      payload => {
        // تحديث القائمة فوراً عند إضافة طلب جديد
        window.location.reload(); 
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);
  return requests;
};
