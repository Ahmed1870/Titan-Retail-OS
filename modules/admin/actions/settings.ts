import { createClient } from '@/lib/supabase/server';
import { auditService } from '@/services';
import { verifyAdmin } from './auth';

export async function getSettingsAction() {
  const { supabase } = await verifyAdmin();
  // @ts-ignore
  const { data } = await supabase.from('settings').select('*').order('key');
  return data ?? [];
}

export async function updateSettingAction(key: string, value: any) {
  const { supabase } = await verifyAdmin();
  // @ts-ignore
  const { error } = await supabase.from('settings').update({ value }).eq('key', key);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function getAuditLogsAction(params: { tenantId?: string, resourceType?: string, page?: number }) {
  await verifyAdmin();
  return await auditService.getLogs(params);
}
