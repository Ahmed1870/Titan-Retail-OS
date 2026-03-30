import { createClient } from '@/lib/supabase/server';

export async function addExpenseAction(amount: number, category: string, description: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: tenant } = await supabase.from('tenants').select('id, store_name').eq('owner_id', user?.id).single();

  await supabase.from('expenses').insert({
    // @ts-ignore
    tenant_id: tenant.id,
    amount,
    category,
    description
  });
  
  await supabase.from('activity_logs').insert({
    // @ts-ignore
    tenant_id: tenant.id,
    user_id: user?.id,
    action_type: 'ADD_EXPENSE',
    metadata: { amount, category }
  });
}
