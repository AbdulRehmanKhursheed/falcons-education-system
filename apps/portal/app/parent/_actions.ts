'use server';

/**
 * Server actions scoped to the parent portal. Every action verifies the
 * caller is a PARENT and that the resource they're touching belongs to
 * them (notifications are filtered by userId; ownership checks live in
 * `lib/queries/parent.ts` for student-scoped resources).
 */

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';

export async function markNotificationRead(notificationId: string): Promise<void> {
  const session = await requireRole(['PARENT']);
  // updateMany with the userId in the where clause makes the action a no-op
  // if a parent submits someone else's notification id — no leak, no throw.
  await db.notification.updateMany({
    where: { id: notificationId, userId: session.user.id },
    data: { read: true },
  });
  revalidatePath('/parent/dashboard');
}

export async function markAllNotificationsRead(): Promise<void> {
  const session = await requireRole(['PARENT']);
  await db.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });
  revalidatePath('/parent/dashboard');
}
