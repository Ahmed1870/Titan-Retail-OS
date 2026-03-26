'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export const useSettings = (tenantId: string) => {
  const [settings, setSettings] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!tenantId) return
    supabase.from('settings').select('*').eq('tenant_id', tenantId).single().then(({ data }) => setSettings(data))
  }, [tenantId])

  return settings
}
