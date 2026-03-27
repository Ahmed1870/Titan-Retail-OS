import { createClient } from '@/lib/supabase/server';

export async function verifyMerchant() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Unauthorized');

  const { data: userData } = await supabase
    .from('users')
    .select('*, tenants(*)')
    .eq('id', session.user.id)
    .single();

  if (!userData || userData.role !== 'merchant') throw new Error('Forbidden');
  
  return { supabase, session, userData, tenant: userData.tenants };
}
