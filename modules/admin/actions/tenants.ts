import { createClient } from '@/lib/supabase/server';
import { reportService } from '@/services';
import { verifyAdmin } from './auth';

export async function getTenantsAction(status?: string) {
  const { supabase } = await verifyAdmin();
  let query = supabase.from('tenants')
    .select('*, subscriptions(plan, status, expires_at), users!owner_id(full_name, email)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('plan_status', status);
  
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getAdminStatsAction() {
  await verifyAdmin();
  return await reportService.getAdminOverview();
}
