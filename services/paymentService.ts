import { supabase } from '../lib/supabase/client';

export const paymentService = {
  // جلب رصيد المحفظة للتاجر
  async getWalletBalance(tenantId: string) {
    const { data, error } = await supabase
      .from('wallets')
      .select('balance, currency')
      .eq('tenant_id', tenantId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // تسجيل عملية دفع جديدة (Vodafone Cash / InstaPay)
  async recordPayment(payload: {
    tenant_id: string,
    amount: number,
    method: string,
    reference_id?: string
  }) {
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        ...payload,
        status: 'PENDING'
      }]);
    
    if (error) throw error;
    return data;
  }
};
