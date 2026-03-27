import { notificationService } from '@/services';
import { createClient } from '@/lib/supabase/server';

async function getUserId() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Unauthorized');
  return session.user.id;
}

export async function getUnreadNotificationsAction() {
  const userId = await getUserId();
  return await notificationService.getUnread(userId);
}

export async function markNotificationReadAction(id?: string, all: boolean = false) {
  const userId = await getUserId();
  if (all) await notificationService.markAllRead(userId);
  else if (id) await notificationService.markRead(id, userId);
  return { success: true };
}
