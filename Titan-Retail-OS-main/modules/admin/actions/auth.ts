import { createClient } from '@/lib/supabase/server'

export async function verifyAdmin() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Unauthorized', status: 401 }
  
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single()
    
  if (user?.role !== 'admin') return { error: 'Forbidden', status: 403 }
  return { supabase, session, user }
}
