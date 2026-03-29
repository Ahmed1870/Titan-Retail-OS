import { createClient } from '@/lib/supabase/server';
export async function addDebt(phone: string, amount: number) {
  const supabase = createClient();
  await supabase.from('customer_debts').insert({ customer_phone: phone, amount });
}
