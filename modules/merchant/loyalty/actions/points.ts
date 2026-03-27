import { createClient } from '@/lib/supabase/server';

export async function getCustomerPoints(phone: string, tenantId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('loyalty_points')
    .select('points_balance')
    .eq('customer_phone', phone)
    .eq('tenant_id', tenantId)
    .single();
  return data?.points_balance || 0;
}
