import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MerchantDashboardClient from '@/components/merchant/MerchantDashboardClient';

export default async function MerchantPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect('/auth/login');

  // جلب بيانات التاجر والـ Tenant (Section 3 & 4)
  const { data: userData } = await supabase
    .from('users')
    .select('*, tenants(*)')
    .eq('id', session.user.id)
    .single();

  if (!userData || userData.role !== 'merchant') redirect('/');

  // جلب إحصائيات سريعة من الداتابيز (Section 10 & 12)
  const { count: ordersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', userData.tenant_id);

  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('tenant_id', userData.tenant_id)
    .single();

  return (
    <MerchantDashboardClient 
      user={userData} 
      stats={{
        orders: ordersCount || 0,
        balance: wallet?.balance || 0,
        storeName: userData.tenants?.store_name || 'متجري'
      }} 
    />
  );
}
