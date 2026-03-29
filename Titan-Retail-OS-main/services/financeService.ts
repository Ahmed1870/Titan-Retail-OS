import { supabase } from '@/lib/supabase/server';

export const FinanceService = {
  async recordTransaction(orderId: string, amount: number, tenantId: string, type: 'income' | 'expense') {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        order_id: orderId,
        amount: amount,
        tenant_id: tenantId,
        type: type,
        created_at: new Date()
      }])
      .select();
      
    if (error) throw new Error('Finance Integrity Violation: ' + error.message);
    return data;
  }
};
