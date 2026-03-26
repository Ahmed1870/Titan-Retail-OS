import { createClient } from '@/lib/supabase/server'

export const auditService = {
  async log(tenantId: string, userId: string, action: string, metadata: any) {
    const supabase = createClient()
    await supabase.from('audit_logs').insert({
      tenant_id: tenantId,
      performed_by: userId,
      action,
      metadata
    })
  }
}
