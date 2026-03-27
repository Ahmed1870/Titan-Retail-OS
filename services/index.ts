export * from './errors';
export * from './orderService';
export * from './inventoryService';
// سيتم إضافة باقي الخدمات (product, report, notification) هنا تباعاً
export const sendWhatsAppNotification = (phone: string, message: string) => {
  const waText = encodeURIComponent(message);
  return `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201019672878'}?text=${waText}`;
};
