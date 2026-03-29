"use client";
'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SubscriptionRequest } from '@/types';

export function useRealtimeSubscriptions() {
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [newRequestId, setNewRequestId] = useState<string | null>(null);
  const supabase = createClient();
  const audioRef = useRef<AudioContext | null>(null);

  const playAlert = () => {
    try {
      if (!audioRef.current) audioRef.current = new AudioContext();
      const osc = audioRef.current.createOscillator();
      const gain = audioRef.current.createGain();
      osc.connect(gain); gain.connect(audioRef.current.destination);
      osc.frequency.value = 440; gain.gain.value = 0.15;
      osc.start(); gain.gain.exponentialRampToValueAtTime(0.001, audioRef.current.currentTime + 0.6);
      setTimeout(() => osc.stop(), 600);
    } catch {}
  };

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('subscription_requests')
        .select('*, tenants(store_name, logo_url)')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: true });
      setRequests((data ?? []) as SubscriptionRequest[]);
    };
    fetch();

    const channel = supabase.channel('sub_requests_admin')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'subscription_requests' }, async (payload) => {
        const { data } = await supabase
          .from('subscription_requests')
          .select('*, tenants(store_name, logo_url)')
          .eq('id', payload.new.id).single();
        if (data) {
          // @ts-ignore
          setRequests(prev => [data as SubscriptionRequest, ...prev]);
          setNewRequestId((data as any).id);
          playAlert();
          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
          setTimeout(() => setNewRequestId(null), 3000);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'subscription_requests' }, (payload) => {
        if (payload.new.status !== 'PENDING') {
          setRequests(prev => prev.filter(r => r.id !== payload.new.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { requests, newRequestId };
}
