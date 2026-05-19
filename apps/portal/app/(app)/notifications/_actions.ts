'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireSession } from '@/lib/auth-helpers';
import {
  getRecentNotifications,
  getUnreadCount,
  type NotificationRow,
} from '@/lib/queries/notifications';

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Mark a single notification as read. Owner-only — throws if the current
 * user doesn't own the row. Returns silently when the row is already read
 * (idempotent so multiple clicks from a UI race don't blow up).
 */
export async function markAsRead(id: string): Promise<ActionResult> {
  const session = await requireSession();

  const row = await db.notification.findUnique({
    where: { id },
    select: { userId: true, read: true },
  });
  if (!row) return { ok: false, error: 'Notification not found' };
  if (row.userId !== session.user.id) {
    return { ok: false, error: 'Not allowed' };
  }
  if (row.read) {
    return { ok: true };
  }

  await db.notification.update({
    where: { id },
    data: { read: true },
  });

  revalidatePath('/notifications');
  revalidatePath('/', 'layout');
  return { ok: true };
}

/**
 * Bulk mark-all-as-read for the current user. Cheaper than fanning out one
 * markAsRead call per row.
 */
export async function markAllAsRead(): Promise<ActionResult & { updated?: number }> {
  const session = await requireSession();

  const result = await db.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  try {
    await db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'notification.mark_all_read',
        entityType: 'User',
        entityId: session.user.id,
        diff: { count: result.count },
      },
    });
  } catch (err) {
    console.warn('[notifications] audit write failed', err);
  }

  revalidatePath('/notifications');
  revalidatePath('/', 'layout');
  return { ok: true, updated: result.count };
}

/**
 * Delete a single notification. Owner-only.
 */
export async function deleteNotification(id: string): Promise<ActionResult> {
  const session = await requireSession();

  const row = await db.notification.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!row) return { ok: false, error: 'Notification not found' };
  if (row.userId !== session.user.id) {
    return { ok: false, error: 'Not allowed' };
  }

  await db.notification.delete({ where: { id } });
  revalidatePath('/notifications');
  revalidatePath('/', 'layout');
  return { ok: true };
}

/**
 * Read-only helper used by the TopBar bell when it needs to refresh after an
 * inline mark-read. Returns the current unread count + top 5 recent rows.
 */
export async function loadNotifications(): Promise<{
  unread: number;
  recent: NotificationRow[];
}> {
  const session = await requireSession();
  const [unread, recent] = await Promise.all([
    getUnreadCount(session.user.id),
    getRecentNotifications(session.user.id, 5),
  ]);
  return { unread, recent };
}
