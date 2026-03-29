import { createClient } from '@/lib/supabase/server';

export async function getMyNotificationsAction() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: 'UNAUTHORIZED' };

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return { error: error.message };
  return { data };
}

export async function markAsReadAction(notificationId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) return { error: error.message };
  return { success: true };
}

// محرك روابط الواتساب الموحد
export function generateWhatsAppLink(phone: string, message: string) {
  const cleanPhone = phone.replace(/\D/g, ''); // تنظيف الرقم
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
}
