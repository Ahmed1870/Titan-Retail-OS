import { getAvailableOrdersAction } from '@/modules/courier/actions/deliveries';
import CourierDashboardClient from '@/modules/courier/components/CourierDashboardClient';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function CourierPageRoot() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  // جلب الطلبات المتاحة في الساحة
  const { data: availableOrders } = await getAvailableOrdersAction();

  // جلب الطلبات الحالية المرتبطة بهذا المندوب
  const { data: activeDeliveries } = await supabase
    .from('deliveries')
    .select('*, orders(*, tenants(store_name))')
    .eq('courier_id', session.user.id)
    .not('status', 'in', '("delivered","failed")');

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200 p-4 font-sans">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white">Courier Hub</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest">Logistics Engine Active</p>
        </div>
        <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
          Online
        </div>
      </header>

      <CourierDashboardClient 
        availableOrders={availableOrders || []} 
        activeDeliveries={activeDeliveries || []} 
      />
    </div>
  );
}
