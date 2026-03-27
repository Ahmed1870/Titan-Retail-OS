import { orderService, reportService, referralService } from '@/services';
import { verifyMerchant } from './auth';

export async function getOrdersAction(params: any = {}) {
  const { tenant } = await verifyMerchant();
  return await orderService.list(tenant.id, params);
}

export async function updateOrderStatusAction(id: string, status: string, reason?: string) {
  const { userData } = await verifyMerchant();
  return await orderService.updateStatus(id, status, userData.id, reason);
}

export async function getDashboardStatsAction() {
  const { tenant } = await verifyMerchant();
  return await reportService.getDashboardStats(tenant.id);
}

export async function getReferralStatsAction() {
  const { tenant } = await verifyMerchant();
  return await referralService.getStats(tenant.id);
}
