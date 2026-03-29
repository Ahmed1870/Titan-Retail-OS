import { createClient } from '@/lib/supabase/server';

export async function getOrderTimelineAction(orderId: string) {
  const supabase = createClient();
  
  // جلب السجل الزمني الدقيق للطلب
  const { data, error } = await supabase
    .from('order_status_logs')
    .select('*, users(full_name, role)')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) return { error: error.message };
  return { data };
}
