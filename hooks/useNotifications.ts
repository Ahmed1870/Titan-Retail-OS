'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Notification } from '@/types';

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      const { data } = await supabase.from('notifications')
        .select('*').eq('user_id', userId)
        .order('created_at', { ascending: false }).limit(20);
      setNotifications((data ?? []) as Notification[]);
      setUnreadCount((data ?? []).filter((n: any) => !n.is_read).length);
    };
    fetch();

    const channel = supabase.channel(`notif_${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          setUnreadCount(c => c + 1);
        }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const markRead = async (id: string) => {
    // @ts-ignore
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  return { notifications, unreadCount, markRead };
}
