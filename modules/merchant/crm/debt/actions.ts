import { createClient } from '@/lib/supabase/server';

export async function addCustomerDebt(phone: string, amount: number, dueDate: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: tenant } = await supabase.from('tenants').select('id, store_name').eq('owner_id', user?.id).single();

  await supabase.from('customer_debts').insert({
    // @ts-ignore
    tenant_id: tenant.id,
    customer_phone: phone,
    amount,
    due_date: dueDate
  });
}
