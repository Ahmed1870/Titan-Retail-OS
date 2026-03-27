import { createClient } from '@/lib/supabase/server';

export async function searchCustomers(query: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('loyalty_points')
    .select('customer_phone, points_balance')
    .ilike('customer_phone', `%${query}%`)
    .limit(10);
  return data;
}
