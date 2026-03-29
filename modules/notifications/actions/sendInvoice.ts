import { sendWhatsAppMessage } from '../services/whatsapp';
export async function sendDigitalInvoice(phone: string, orderData: any) {
  const msg = `🧾 *Invoice from ${orderData.tenantName}*\nTotal: ${orderData.total} EGP\nView: ${process.env.TITAN_APP_URL}/receipt/${orderData.id}`;
  return await sendWhatsAppMessage(phone, msg);
}
