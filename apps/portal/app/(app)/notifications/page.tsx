import {
  Bell,
  ClipboardList,
  CreditCard,
  CalendarCheck,
  GraduationCap,
  Megaphone,
  Settings as SettingsIcon,
} from 'lucide-react';
import type { NotificationKind } from '@prisma/client';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { requireSession } from '@/lib/auth-helpers';
import { getAllNotifications } from '@/lib/queries/notifications';
import { NotificationsList } from '@/components/data/NotificationsList';
import { NOTIFICATION_KINDS } from '@/lib/schemas/notifications';

export const metadata = { title: 'Notifications' };

const KIND_LABEL: Record<NotificationKind, string> = {
  ADMISSION:    'Admission',
  FEE:          'Fee',
  ATTENDANCE:   'Attendance',
  ASSESSMENT:   'Assessment',
  ANNOUNCEMENT: 'Announcement',
  SYSTEM:       'System',
};

const KIND_TONE: Record<NotificationKind, Parameters<typeof Chip>[0]['tone']> = {
  ADMISSION:    'info',
  FEE:          'success',
  ATTENDANCE:   'warn',
  ASSESSMENT:   'brand',
  ANNOUNCEMENT: 'accent',
  SYSTEM:       'neutral',
};

const KIND_ICON: Record<NotificationKind, typeof Bell> = {
  ADMISSION:    ClipboardList,
  FEE:          CreditCard,
  ATTENDANCE:   CalendarCheck,
  ASSESSMENT:   GraduationCap,
  ANNOUNCEMENT: Megaphone,
  SYSTEM:       SettingsIcon,
};

type SearchParams = Promise<{ kind?: string; unread?: string }>;

function parseKind(value: string | undefined): NotificationKind | undefined {
  if (!value) return undefined;
  const upper = value.toUpperCase() as NotificationKind;
  return (NOTIFICATION_KINDS as readonly string[]).includes(upper)
    ? upper
    : undefined;
}

export default async function NotificationsPage(props: {
  searchParams: SearchParams;
}) {
  const session = await requireSession();
  const params = await props.searchParams;
  const kindFilter = parseKind(params.kind);
  const unreadOnly = params.unread === '1';

  const { rows, total, unread, byKind } = await getAllNotifications(
    session.user.id,
    { kind: kindFilter, unreadOnly, take: 100 },
  );

  // Most-active kind: pick the highest-count entry once, then reuse it for
  // both the KPI value and subtitle. Previously this was computed three times
  // inline inside the JSX.
  const mostActive = (
    Object.entries(byKind) as Array<[NotificationKind, number]>
  ).reduce<{ kind: NotificationKind | null; count: number }>(
    (best, [kind, count]) =>
      count > best.count ? { kind, count } : best,
    { kind: null, count: 0 },
  );

  return (
    <>
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="A running log of everything the portal has sent you — fees, attendance, announcements, and more."
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <KpiTile
          label="Unread"
          value={unread}
          tone="accent"
        />
        <KpiTile
          label="Total"
          value={total}
          tone="neutral"
        />
        <KpiTile
          label="This kind"
          value={kindFilter ? byKind[kindFilter] : total}
          tone="brand"
        />
        <KpiTile
          label="Most active"
          value={mostActive.count}
          subtitle={mostActive.kind ? KIND_LABEL[mostActive.kind] : '—'}
          tone="info"
        />
      </div>

      {/* By-kind breakdown — quick visual scan */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-faint mr-1">
          By kind
        </span>
        {(Object.keys(byKind) as NotificationKind[]).map((k) => (
          <Chip key={k} tone={KIND_TONE[k]}>
            <span className="tabular-nums font-semibold mr-1">{byKind[k]}</span>
            {KIND_LABEL[k]}
          </Chip>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Inbox"
          meta={
            unreadOnly
              ? `Showing unread only (${rows.length})`
              : kindFilter
                ? `Filtering by ${KIND_LABEL[kindFilter].toLowerCase()} (${rows.length})`
                : `Showing ${rows.length} of ${total}`
          }
        />
        <NotificationsList
          initialRows={rows}
          activeKind={kindFilter ?? 'ALL'}
          unreadOnly={unreadOnly}
          unreadTotal={unread}
          kindLabels={KIND_LABEL}
          kindIcons={KIND_ICON}
          kindTones={KIND_TONE}
        />
      </Card>
    </>
  );
}

function KpiTile({
  label,
  value,
  subtitle,
  tone,
}: {
  label: string;
  value: number;
  subtitle?: string;
  tone: 'accent' | 'brand' | 'info' | 'neutral';
}) {
  const accentClass = {
    accent:  'text-accent',
    brand:   'text-brand-dark',
    info:    'text-info',
    neutral: 'text-ink',
  }[tone];
  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-3">
      <p className="text-[10.5px] uppercase tracking-[0.16em] font-semibold text-ink-faint">
        {label}
      </p>
      <p
        className={`mt-1 font-display text-[1.75rem] leading-none ${accentClass} tabular-nums`}
        style={{ fontVariationSettings: '"opsz" 72' }}
      >
        {value}
      </p>
      {subtitle && (
        <p className="mt-1 text-[11.5px] text-ink-muted truncate">{subtitle}</p>
      )}
    </div>
  );
}
