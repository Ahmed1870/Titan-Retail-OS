import { handleCreateOrder } from '../../actions'

export const processFastSale = async (cartItems: any[], totalAmount: number, tenantId: string, userId: string) => {
  const orderData = {
    amount: totalAmount,
    items: cartItems,
    status: 'delivered', // البيع السريع دايماً مستلم
    payment_method: 'cash'
  };

  return await handleCreateOrder(orderData, tenantId, userId);
};
