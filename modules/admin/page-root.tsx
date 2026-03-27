import { redirect } from 'next/navigation';
import { verifyAdmin } from './actions/auth';
import DashboardClient from './components/DashboardClient';
import { getAdminStatsAction } from './actions/tenants';
import { getPendingRequestsAction } from './actions/subscriptions';

export default async function AdminRoot() {
  const { session, error } = await verifyAdmin();
  if (error || !session) redirect('/auth/login');

  // جلب البيانات الأولية في السيرفر لسرعة التحميل
  const [stats, initialRequests] = await Promise.all([
    getAdminStatsAction(),
    getPendingRequestsAction()
  ]);

  return (
    <DashboardClient 
      userId={session.user.id} 
      initialStats={stats} 
      initialRequests={initialRequests} 
    />
  );
}
