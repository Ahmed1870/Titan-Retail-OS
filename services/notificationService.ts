import { createClient } from '@/lib/supabase/server'

export const notificationService = {
  async send(tenantId: string, userId: string, title: string, message: string, type: string = 'info') {
    const supabase = createClient()
    await supabase.from('notifications').insert({
      tenant_id: tenantId,
      user_id: userId,
      title,
      message,
      type,
      is_read: false
    })
  }
}
