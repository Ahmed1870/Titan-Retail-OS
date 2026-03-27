import { createClient } from '@/lib/supabase/server';
import { sendWhatsAppMessage } from '../services/whatsapp';

export async function generateAndSendDailyReport(tenantId: string) {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  // 1. جلب إحصائيات اليوم (مبيعات + طلبات)
  const { data: stats } = await supabase
    .from('orders')
    .select('total')
    .eq('tenant_id', tenantId)
    .gte('created_at', today);

  const totalSales = stats?.reduce((acc, curr) => acc + curr.total, 0) || 0;
  const orderCount = stats?.length || 0;

  // 2. جلب هاتف التاجر من جدول tenants (Schema v2.0)
  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, settings')
    .eq('id', tenantId)
    .single();

  const phone = tenant?.settings?.phone;

  if (phone) {
    const message = `🚀 *Titan Daily Report: ${tenant.name}*\n\n` +
                    `📅 Date: ${today}\n` +
                    `💰 Total Sales: ${totalSales} EGP\n` +
                    `📦 Total Orders: ${orderCount}\n\n` +
                    `✅ System Secure & Synced.`;

    const sent = await sendWhatsAppMessage(phone, message);
    
    if (sent) {
      await supabase.from('notification_logs').insert({
        tenant_id: tenantId,
        recipient_phone: phone,
        message_type: 'DAILY_REPORT',
        metadata: { sales: totalSales, orders: orderCount }
      });
    }
  }
}
