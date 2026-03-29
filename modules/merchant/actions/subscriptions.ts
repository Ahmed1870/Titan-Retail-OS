import { subscriptionService } from '@/services';
import { verifyMerchant } from './auth';

export async function createSubscriptionRequestAction(formData: any) {
  const { userData, tenant } = await verifyMerchant();
  return await subscriptionService.createRequest({
    tenantId: tenant.id,
    requestedBy: userData.id,
    plan: formData.plan,
    paymentMethod: formData.payment_method,
    fullName: formData.full_name,
    phoneNumber: formData.phone_number,
  });
}
