import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export const useProfile = () => {
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) supabase.from('users').select('*, tenants(*)').eq('id', user.id).single().then(({ data }) => setProfile(data))
    })
  }, [])

  return profile
}
