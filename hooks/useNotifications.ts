'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return
    
    supabase.from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setNotifications(data || []))

    const channel = supabase.channel('user_notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, 
      (payload) => setNotifications(prev => [payload.new, ...prev]))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return notifications
}
