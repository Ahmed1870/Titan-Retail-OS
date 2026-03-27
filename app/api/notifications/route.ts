export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { notificationService } from '@/services';

export const GET = withAuth(['admin','merchant','courier','customer'], async (_req: NextRequest, { user }: any) => {
  const notifications = await notificationService.getUnread(user.id);
  return NextResponse.json(notifications);
});

export const PATCH = withAuth(['admin','merchant','courier','customer'], async (req: NextRequest, { user }: any) => {
  const { id, all } = await req.json();
  if (all) await notificationService.markAllRead(user.id);
  else if (id) await notificationService.markRead(id, user.id);
  return NextResponse.json({ success: true });
});
