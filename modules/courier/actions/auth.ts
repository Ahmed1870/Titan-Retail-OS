import { createClient } from '@/lib/supabase/server';

export async function verifyCourier() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Unauthorized');

  const { data: user } = await supabase
    .from('users')
    .select('*, tenants(*)')
    .eq('id', session.user.id)
    .single();

  if (!user || user.role !== 'courier') throw new Error('Forbidden');
  
  return { supabase, session, user };
}
