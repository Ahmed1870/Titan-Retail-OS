export const dynamic = "force-dynamic";
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import MerchantDashboardClient from '@/components/merchant/MerchantDashboardClient';

export default async function MerchantPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');
  const { data: user } = await supabase.from('users').select('*, tenants(*)').eq('id', session.user.id).single();
  if (!user || user.role !== 'merchant') redirect('/');
  return <MerchantDashboardClient user={user} tenant={user.tenants} />;
}
