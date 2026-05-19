'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  CreditCard,
  ClipboardList,
  CalendarCheck,
  GraduationCap,
  Megaphone,
  Settings as SettingsIcon,
  ArrowRight,
  Inbox,
} from 'lucide-react';
import type { NotificationKind } from '@prisma/client';
import { cn } from '@/lib/cn';
import type { NotificationRow } from '@/lib/queries/notifications';
import {
  markAsRead,
  markAllAsRead,
  loadNotifications,
} from '@/app/(app)/notifications/_actions';

const KIND_ICON: Record<NotificationKind, typeof Bell> = {
  ADMISSION: ClipboardList,
  FEE: CreditCard,
  ATTENDANCE: CalendarCheck,
  ASSESSMENT: GraduationCap,
  ANNOUNCEMENT: Megaphone,
  SYSTEM: SettingsIcon,
};

const KIND_TONE: Record<
  NotificationKind,
  { wrap: string; icon: string }
> = {
  ADMISSION:    { wrap: 'bg-info-soft',    icon: 'text-info' },
  FEE:          { wrap: 'bg-success-soft', icon: 'text-success' },
  ATTENDANCE:   { wrap: 'bg-warn-soft',    icon: 'text-warn' },
  ASSESSMENT:   { wrap: 'bg-brand-soft',   icon: 'text-brand' },
  ANNOUNCEMENT: { wrap: 'bg-accent-soft',  icon: 'text-accent' },
  SYSTEM:       { wrap: 'bg-surface-3',    icon: 'text-ink-soft' },
};

const KIND_LABEL: Record<NotificationKind, string> = {
  ADMISSION:    'Admission',
  FEE:          'Fee',
  ATTENDANCE:   'Attendance',
  ASSESSMENT:   'Assessment',
  ANNOUNCEMENT: 'Announcement',
  SYSTEM:       'System',
};

function relativeShort(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(diffMs / 60_000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-PK', {
    month: 'short',
    day: 'numeric',
  });
}

type Props = {
  initialUnread: number;
  initialRecent: NotificationRow[];
};

export function NotificationBell({ initialUnread, initialRecent }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const [items, setItems] = useState<NotificationRow[]>(initialRecent);
  const [isPending, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Keep local state in sync with the server-pushed data — this fires when
  // a parent revalidate causes new initial props to flow in.
  useEffect(() => {
    setUnread(initialUnread);
    setItems(initialRecent);
  }, [initialUnread, initialRecent]);

  // Outside-click + ESC close.
  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const refresh = useCallback(async () => {
    try {
      const fresh = await loadNotifications();
      setUnread(fresh.unread);
      setItems(fresh.recent);
    } catch (err) {
      console.warn('[notifications] refresh failed', err);
    }
  }, []);

  const handleRowClick = useCallback(
    (row: NotificationRow) => {
      // Optimistic — gray out the row and decrement the badge immediately.
      if (!row.read) {
        setItems((prev) =>
          prev.map((r) => (r.id === row.id ? { ...r, read: true } : r)),
        );
        setUnread((n) => Math.max(0, n - 1));
      }

      startTransition(async () => {
        if (!row.read) {
          await markAsRead(row.id);
        }
        if (row.link) {
          router.push(row.link);
        } else {
          router.push('/notifications');
        }
        // Sync with server after the transition.
        await refresh();
      });
      setOpen(false);
    },
    [router, refresh],
  );

  const handleMarkAll = useCallback(() => {
    // Optimistic.
    setItems((prev) => prev.map((r) => ({ ...r, read: true })));
    setUnread(0);
    startTransition(async () => {
      await markAllAsRead();
      await refresh();
    });
  }, [refresh]);

  const displayedUnread = items.filter((r) => !r.read).slice(0, 5);
  const fallback = items.slice(0, 5);
  const list = displayedUnread.length > 0 ? displayedUnread : fallback;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'relative inline-flex items-center justify-center w-9 h-9 rounded-md text-ink-soft hover:bg-surface-3 transition-colors',
          open && 'bg-surface-3 text-ink',
        )}
      >
        <Bell className="w-4 h-4" strokeWidth={1.75} />
        {unread > 0 && (
          <span
            className={cn(
              'absolute -top-0.5 -right-0.5 inline-flex items-center justify-center',
              'min-w-[16px] h-[16px] px-1 rounded-full bg-accent text-paper',
              'text-[9.5px] font-semibold leading-none tabular-nums',
              'ring-2 ring-surface',
            )}
            aria-label={`${unread} unread notifications`}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Subtle backdrop — captures outside taps on mobile but stays
              visually transparent so the chrome reads as a dropdown not a modal. */}
          <div
            className="fixed inset-0 z-30 lg:hidden"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className={cn(
              'absolute right-0 top-full mt-1.5 z-40',
              'w-[calc(100vw-1.5rem)] max-w-[360px] sm:w-[360px]',
              'rounded-lg border border-line bg-surface shadow-[var(--shadow-float)] overflow-hidden',
            )}
          >
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-line-soft">
              <div>
                <p className="text-[12px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
                  Notifications
                </p>
                <p className="text-[12.5px] text-ink-soft mt-0.5">
                  {unread > 0
                    ? `${unread} unread`
                    : 'You are all caught up.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleMarkAll}
                disabled={isPending || unread === 0}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11.5px] font-semibold transition-colors',
                  unread === 0
                    ? 'text-ink-faint cursor-not-allowed'
                    : 'text-ink-soft hover:bg-surface-2 hover:text-ink',
                )}
                title="Mark all as read"
              >
                <CheckCheck className="w-3 h-3" strokeWidth={2} />
                Mark all
              </button>
            </div>

            {list.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-surface-3 text-ink-faint">
                  <Inbox className="w-4 h-4" strokeWidth={1.75} />
                </span>
                <p className="text-[12.5px] text-ink-soft">
                  Nothing new to show.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-line-soft max-h-[60vh] overflow-y-auto">
                {list.map((row) => {
                  const Icon = KIND_ICON[row.kind] ?? Bell;
                  const tone = KIND_TONE[row.kind];
                  return (
                    <li key={row.id}>
                      <button
                        type="button"
                        onClick={() => handleRowClick(row)}
                        className={cn(
                          'group w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
                          'hover:bg-surface-2',
                          !row.read && 'bg-surface',
                        )}
                      >
                        <span
                          className={cn(
                            'shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md',
                            tone.wrap,
                          )}
                        >
                          <Icon
                            className={cn('w-3.5 h-3.5', tone.icon)}
                            strokeWidth={1.75}
                          />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
                              {KIND_LABEL[row.kind]}
                            </span>
                            {!row.read && (
                              <span
                                className="inline-block w-1.5 h-1.5 rounded-full bg-accent"
                                aria-label="Unread"
                              />
                            )}
                            <span className="ml-auto text-[10.5px] text-ink-faint tabular-nums">
                              {relativeShort(row.createdAt)}
                            </span>
                          </div>
                          <p
                            className={cn(
                              'mt-0.5 text-[12.5px] leading-snug truncate',
                              row.read ? 'text-ink-soft' : 'text-ink font-semibold',
                            )}
                          >
                            {row.title}
                          </p>
                          {row.body && (
                            <p className="mt-0.5 text-[11.5px] text-ink-faint leading-snug line-clamp-2">
                              {row.body}
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="border-t border-line-soft">
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-2 px-4 py-2.5 text-[12px] font-semibold text-ink-soft hover:bg-surface-2 hover:text-ink transition-colors"
              >
                View all notifications
                <ArrowRight className="w-3 h-3" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
