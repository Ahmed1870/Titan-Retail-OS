import { createClient } from '@/lib/supabase/server';

export async function verifyMerchant() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!tenant) throw new Error("Merchant tenant not found");
  // هنا نرجع user بدلاً من userData لتوافق الكود
  return { user, userData: user, tenant };
}

export async function getMerchantContextAction() {
  return await verifyMerchant();
}
