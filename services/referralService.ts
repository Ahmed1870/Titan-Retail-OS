import { createClient } from '@/lib/supabase/server'

export const referralService = {
  async trackReferral(code: string, newTenantId: string) {
    const supabase = createClient()
    const { data: referrer } = await supabase.from('tenants').select('id').eq('referral_code', code).single()
    
    if (referrer) {
      await supabase.from('referrals').insert({
        referrer_tenant_id: referrer.id,
        referred_tenant_id: newTenantId,
        status: 'PENDING_FIRST_PAYMENT'
      })
    }
  }
}
