import { redirect } from 'next/navigation';
import { verifyMerchant } from './actions/auth';
import MerchantDashboardClient from './components/MerchantDashboardClient';
import { getDashboardStatsAction } from './actions/orders';

export default async function MerchantRoot() {
  try {
    const { userData, tenant } = await verifyMerchant();
    
    // جلب بيانات الواجهة الأولية
    const stats = await getDashboardStatsAction();

    return (
      <MerchantDashboardClient 
        user={userData} 
        tenant={tenant}
        initialStats={stats}
      />
    );
  } catch (e) {
    redirect('/auth/login');
  }
}
