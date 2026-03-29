"use client";
'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // 1. جلب التنبيهات الحالية
    const fetchInitial = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setNotifications(data);
    };

    fetchInitial();

    // 2. الاشتراك في التحديثات اللحظية (The Heartbeat)
    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
        // هنا يمكن إضافة صوت تنبيه (Notification Sound)
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return { notifications };
}
