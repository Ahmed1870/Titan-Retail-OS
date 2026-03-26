import { supabase } from '../lib/supabase/client';

export const subscriptionService = {
  // جلب الطلبات الحقيقية من جدول subscription_requests
  async getPendingRequests() {
    const { data, error } = await supabase
      .from('subscription_requests')
      .select('*, tenants(store_name, logo_url)')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching requests:', error);
      return [];
    }
    return data;
  },

  // تفعيل التاجر رسمياً في الداتابيز
  async approveRequest(requestId: string, tenantId: string, plan: string) {
    const { error } = await supabase.rpc('approve_subscription', {
      req_id: requestId,
      t_id: tenantId,
      new_plan: plan
    });

    if (error) throw error;
    return true;
  }
};
