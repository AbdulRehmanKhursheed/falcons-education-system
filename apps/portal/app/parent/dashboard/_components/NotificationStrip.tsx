'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import {
  Bell,
  ClipboardList,
  Receipt,
  CalendarCheck,
  BookOpen,
  Megaphone,
  CheckCheck,
} from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/cn';
import { relativeTime } from '@/lib/format';
import {
  markNotificationRead,
  markAllNotificationsRead,
} from '../../_actions';
import type { ParentNotificationRow } from '@/lib/queries/parent';

const kindMeta: Record<
  ParentNotificationRow['kind'],
  { tone: Parameters<typeof Chip>[0]['tone']; label: string; Icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }
> = {
  ADMISSION: { tone: 'info', label: 'Admission', Icon: ClipboardList },
  FEE: { tone: 'warn', label: 'Fees', Icon: Receipt },
  ATTENDANCE: { tone: 'success', label: 'Attendance', Icon: CalendarCheck },
  ASSESSMENT: { tone: 'brand', label: 'Academics', Icon: BookOpen },
  ANNOUNCEMENT: { tone: 'accent', label: 'Announcement', Icon: Megaphone },
  SYSTEM: { tone: 'neutral', label: 'System', Icon: Bell },
};

export function NotificationStrip({
  notifications,
}: {
  notifications: ParentNotificationRow[];
}) {
  const [isPending, startTransition] = useTransition();

  function handleMarkOne(id: string) {
    startTransition(async () => {
      await markNotificationRead(id);
    });
  }

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
    });
  }

  if (notifications.length === 0) {
    return (
      <div className="px-5 py-8 text-center">
        <CheckCheck className="w-5 h-5 text-success mx-auto mb-2" strokeWidth={1.75} />
        <p className="text-[13px] text-ink-muted">
          Nothing new. We&rsquo;ll let you know when there is.
        </p>
      </div>
    );
  }

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div>
      <ul className="divide-y divide-line-soft">
        {notifications.map((n) => {
          const meta = kindMeta[n.kind];
          const Icon = meta.Icon;
          return (
            <li
              key={n.id}
              className={cn(
                'px-5 py-3.5 flex items-start gap-3 transition-colors',
                !n.read && 'bg-accent-soft/30',
              )}
            >
              <span
                className={cn(
                  'shrink-0 mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-md',
                  n.read ? 'bg-surface-3 text-ink-faint' : 'bg-accent text-paper',
                )}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <Chip tone={meta.tone}>{meta.label}</Chip>
                  {!n.read && (
                    <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-accent">
                      New
                    </span>
                  )}
                  <span className="text-[10.5px] text-ink-faint ml-auto tabular">
                    {relativeTime(n.createdAt)}
                  </span>
                </div>
                <p className="text-[13.5px] text-ink font-semibold leading-snug">
                  {n.title}
                </p>
                {n.body && (
                  <p className="text-[12.5px] text-ink-muted leading-snug mt-0.5">
                    {n.body}
                  </p>
                )}
                <div className="mt-1.5 flex items-center gap-3">
                  {n.link && (
                    <Link
                      href={resolveParentLink(n.link)}
                      className="text-[11.5px] font-semibold text-ink-soft hover:text-ink underline decoration-line decoration-1 underline-offset-[5px]"
                    >
                      Open
                    </Link>
                  )}
                  {!n.read && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleMarkOne(n.id)}
                      className="text-[11.5px] font-semibold text-ink-faint hover:text-ink disabled:opacity-50 transition-colors"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {hasUnread && (
        <div className="border-t border-line-soft px-5 py-3 flex justify-end">
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft hover:text-ink transition-colors disabled:opacity-50"
          >
            <CheckCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Notifications inserted by other modules link to admin URLs by default
 * (e.g. /fees, /attendance). Steer the parent to the equivalent parent
 * surface so the link doesn't bounce through middleware.
 */
function resolveParentLink(link: string): string {
  if (link.startsWith('/parent')) return link;
  if (link.startsWith('/announcements')) return '/parent/announcements';
  if (link.startsWith('/fees') || link.startsWith('/attendance') || link.startsWith('/homework')) {
    return '/parent/dashboard';
  }
  return '/parent/dashboard';
}
