import { subscriptionService } from '@/services';
import { verifyAdmin } from './auth';

export async function getPendingRequestsAction() {
  await verifyAdmin();
  return await subscriptionService.getPendingRequests();
}

export async function approveSubscriptionAction(id: string) {
  const { session } = await verifyAdmin();
    // @ts-ignore
  return await subscriptionService.approveRequest(id, session.user.id);
}

export async function rejectSubscriptionAction(id: string, reason: string) {
  const { session } = await verifyAdmin();
  if (!reason?.trim()) throw new Error('Reason required');
    // @ts-ignore
  return await subscriptionService.rejectRequest(id, session.user.id, reason);
}
