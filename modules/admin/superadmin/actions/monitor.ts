import { createClient } from '@/lib/supabase/server';

export async function getGlobalMetricsAction() {
  const supabase = createClient();
  
  // التحقق من أن المستخدم هو SuperAdmin فعلاً (Security Layer)
  const { data: { session } } = await supabase.auth.getSession();
  const { data: user } = await supabase.from('users').select('role').eq('id', session?.user.id).single();
  
  if (user?.role !== 'admin') return { error: 'ACCESS_DENIED_SYSTEM_LEVEL' };

  const { data, error } = await supabase
    .from('platform_global_metrics')
    .select('*')
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function getAllTenantsAction() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tenants')
    .select('id, name, slug, current_plan, plan_status, created_at, owner_id(full_name, email)')
    .order('created_at', { ascending: false });

  if (error) return { error: error.message };
  return { data };
}
