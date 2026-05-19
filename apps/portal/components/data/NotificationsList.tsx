'use client';

import { useCallback, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ArrowRight, CheckCheck, Inbox, Trash2, Bell, Filter } from 'lucide-react';
import type { NotificationKind } from '@prisma/client';
import { cn } from '@/lib/cn';
import { Chip } from '@/components/ui/Chip';
import { relativeTime } from '@/lib/format';
import type { NotificationRow } from '@/lib/queries/notifications';
import {
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '@/app/(app)/notifications/_actions';

type ActiveKind = NotificationKind | 'ALL';

type Props = {
  initialRows: NotificationRow[];
  activeKind: ActiveKind;
  unreadOnly: boolean;
  unreadTotal: number;
  kindLabels: Record<NotificationKind, string>;
  kindIcons: Record<NotificationKind, typeof Bell>;
  kindTones: Record<NotificationKind, Parameters<typeof Chip>[0]['tone']>;
};

const KIND_ORDER: NotificationKind[] = [
  'ADMISSION',
  'FEE',
  'ATTENDANCE',
  'ASSESSMENT',
  'ANNOUNCEMENT',
  'SYSTEM',
];

export function NotificationsList({
  initialRows,
  activeKind,
  unreadOnly,
  unreadTotal,
  kindLabels,
  kindIcons,
  kindTones,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [rows, setRows] = useState(initialRows);
  const [isPending, startTransition] = useTransition();

  // Build href that toggles a single filter while preserving the rest.
  const buildHref = useCallback(
    (changes: { kind?: ActiveKind; unread?: boolean }) => {
      const next = new URLSearchParams(params.toString());
      if (changes.kind !== undefined) {
        if (changes.kind === 'ALL') next.delete('kind');
        else next.set('kind', changes.kind.toLowerCase());
      }
      if (changes.unread !== undefined) {
        if (changes.unread) next.set('unread', '1');
        else next.delete('unread');
      }
      const qs = next.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [params, pathname],
  );

  const handleRowClick = useCallback(
    (row: NotificationRow) => {
      if (!row.read) {
        setRows((prev) =>
          prev.map((r) => (r.id === row.id ? { ...r, read: true } : r)),
        );
      }
      startTransition(async () => {
        if (!row.read) await markAsRead(row.id);
        if (row.link) {
          router.push(row.link);
        } else {
          router.refresh();
        }
      });
    },
    [router],
  );

  const handleMarkAll = useCallback(() => {
    setRows((prev) => prev.map((r) => ({ ...r, read: true })));
    startTransition(async () => {
      await markAllAsRead();
      router.refresh();
    });
  }, [router]);

  const handleDelete = useCallback(
    (id: string) => {
      setRows((prev) => prev.filter((r) => r.id !== id));
      startTransition(async () => {
        await deleteNotification(id);
        router.refresh();
      });
    },
    [router],
  );

  return (
    <div className="flex flex-col">
      {/* Filter chips + bulk actions */}
      <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-line-soft bg-surface-2/40">
        <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-faint mr-1">
          <Filter className="w-3 h-3" strokeWidth={2} />
          Filter
        </span>
        <FilterPill href={buildHref({ kind: 'ALL' })} active={activeKind === 'ALL'}>
          All
        </FilterPill>
        {KIND_ORDER.map((k) => (
          <FilterPill
            key={k}
            href={buildHref({ kind: k })}
            active={activeKind === k}
          >
            {kindLabels[k]}
          </FilterPill>
        ))}
        <FilterPill
          href={buildHref({ unread: !unreadOnly })}
          active={unreadOnly}
          tone="accent"
        >
          Unread only
        </FilterPill>

        <button
          type="button"
          onClick={handleMarkAll}
          disabled={isPending || unreadTotal === 0}
          className={cn(
            'ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11.5px] font-semibold transition-colors',
            unreadTotal === 0
              ? 'border-line text-ink-faint cursor-not-allowed'
              : 'border-line bg-surface text-ink-soft hover:bg-surface-3 hover:text-ink',
          )}
        >
          <CheckCheck className="w-3 h-3" strokeWidth={2} />
          Mark all read
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-3 text-ink-faint">
            <Inbox className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <div>
            <p className="text-[14px] font-semibold text-ink">
              No notifications here.
            </p>
            <p className="mt-1 text-[12.5px] text-ink-muted">
              {unreadOnly
                ? 'You are all caught up. Switch the filter to see read notifications.'
                : 'When something happens that needs your attention, it will show up here.'}
            </p>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-line-soft">
          {rows.map((row) => {
            const Icon = kindIcons[row.kind] ?? Bell;
            return (
              <li key={row.id} className="relative group">
                <button
                  type="button"
                  onClick={() => handleRowClick(row)}
                  className={cn(
                    'w-full flex items-start gap-4 px-5 py-4 text-left transition-colors',
                    'hover:bg-surface-2',
                    !row.read && 'bg-surface',
                  )}
                >
                  <span
                    className={cn(
                      'shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-md border border-line-soft',
                      'bg-surface-2',
                    )}
                  >
                    <Icon
                      className="w-4 h-4 text-ink-soft"
                      strokeWidth={1.75}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Chip tone={kindTones[row.kind]}>
                        {kindLabels[row.kind]}
                      </Chip>
                      {!row.read && (
                        <span className="inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.14em] font-semibold text-accent">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent" />
                          New
                        </span>
                      )}
                      <span className="ml-auto text-[11px] text-ink-faint tabular-nums">
                        {relativeTime(row.createdAt)}
                      </span>
                    </div>
                    <p
                      className={cn(
                        'mt-1.5 text-[13.5px] leading-snug',
                        row.read ? 'text-ink-soft' : 'text-ink font-semibold',
                      )}
                    >
                      {row.title}
                    </p>
                    {row.body && (
                      <p className="mt-1 text-[12.5px] text-ink-muted leading-snug">
                        {row.body}
                      </p>
                    )}
                    {row.link && (
                      <span className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-semibold text-ink-soft group-hover:text-ink transition-colors">
                        Open
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                      </span>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(row.id);
                  }}
                  aria-label="Delete notification"
                  className="absolute top-3 right-3 p-1 rounded text-ink-faint hover:text-danger hover:bg-danger-soft opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FilterPill({
  href,
  active,
  tone = 'default',
  children,
}: {
  href: string;
  active: boolean;
  tone?: 'default' | 'accent';
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-md border text-[11.5px] font-semibold transition-colors',
        active
          ? tone === 'accent'
            ? 'border-accent bg-accent-soft text-accent'
            : 'border-ink bg-ink text-paper'
          : 'border-line bg-surface text-ink-soft hover:bg-surface-3 hover:text-ink',
      )}
    >
      {children}
    </Link>
  );
}
