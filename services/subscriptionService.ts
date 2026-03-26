import { createClient } from '@/lib/supabase/server'

export const subscriptionService = {
  async checkTenantAccess(tenantId: string): Promise<boolean> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('tenants')
      .select('plan_status, plan_expires_at')
      .eq('id', tenantId)
      .single()

    if (error || !data) return false
    if (data.plan_status !== 'active') return false
    
    const expiry = data.plan_expires_at ? new Date(data.plan_expires_at) : null
    return expiry ? expiry > new Date() : false
  }
}
