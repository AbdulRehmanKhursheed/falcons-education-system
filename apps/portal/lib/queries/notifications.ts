/**
 * Notification reads — plain serialisable shapes so server components can
 * hand the data to client components without lugging Prisma types across the
 * RSC boundary.
 */

import { db } from '@/lib/db';
import type { NotificationKind } from '@prisma/client';

export type NotificationRow = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string; // ISO
};

export async function getUnreadCount(userId: string): Promise<number> {
  if (!userId) return 0;
  return db.notification.count({ where: { userId, read: false } });
}

export async function getRecentNotifications(
  userId: string,
  limit = 5,
): Promise<NotificationRow[]> {
  if (!userId) return [];
  const rows = await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      kind: true,
      title: true,
      body: true,
      link: true,
      read: true,
      createdAt: true,
    },
  });
  return rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));
}

export type AllNotificationsOpts = {
  kind?: NotificationKind;
  unreadOnly?: boolean;
  take?: number;
  skip?: number;
};

export type NotificationListResult = {
  rows: NotificationRow[];
  total: number;
  unread: number;
  byKind: Record<NotificationKind, number>;
};

const EMPTY_BY_KIND: Record<NotificationKind, number> = {
  ADMISSION: 0,
  FEE: 0,
  ATTENDANCE: 0,
  ASSESSMENT: 0,
  ANNOUNCEMENT: 0,
  SYSTEM: 0,
};

export async function getAllNotifications(
  userId: string,
  opts: AllNotificationsOpts = {},
): Promise<NotificationListResult> {
  if (!userId) {
    return {
      rows: [],
      total: 0,
      unread: 0,
      byKind: { ...EMPTY_BY_KIND },
    };
  }

  const where: {
    userId: string;
    kind?: NotificationKind;
    read?: boolean;
  } = { userId };
  if (opts.kind) where.kind = opts.kind;
  if (opts.unreadOnly) where.read = false;

  const [rows, total, unread, kindCounts] = await Promise.all([
    db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: opts.take ?? 100,
      skip: opts.skip ?? 0,
      select: {
        id: true,
        kind: true,
        title: true,
        body: true,
        link: true,
        read: true,
        createdAt: true,
      },
    }),
    db.notification.count({ where: { userId } }),
    db.notification.count({ where: { userId, read: false } }),
    db.notification.groupBy({
      by: ['kind'],
      where: { userId },
      _count: { _all: true },
    }),
  ]);

  const byKind: Record<NotificationKind, number> = { ...EMPTY_BY_KIND };
  for (const row of kindCounts) {
    byKind[row.kind] = row._count._all;
  }

  return {
    rows: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    total,
    unread,
    byKind,
  };
}
