import Link from 'next/link';
import {
  ArrowUpRight,
  CalendarCheck,
  Receipt,
  BookOpen,
  Phone,
  MessageCircle,
  MapPin,
  Megaphone,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import {
  formatPKR,
  formatPercent,
  formatDate,
  relativeTime,
} from '@/lib/format';
import { requireRole } from '@/lib/auth-helpers';
import {
  getParentChildCards,
  getParentNotifications,
  getParentAnnouncements,
} from '@/lib/queries/parent';
import { schoolProfile, formatSchoolAddress } from '@/lib/school-config';
import { NotificationStrip } from './_components/NotificationStrip';

export const metadata = { title: 'Parent dashboard' };

const programLabel: Record<string, string> = {
  NURSERY: 'Nursery',
  MONTESSORI: 'Montessori',
  KINDERGARTEN: 'Kindergarten',
  PRIMARY: 'Primary',
  EVENING_COACHING: 'Evening coaching',
  SATURDAY_COACHING: 'Saturday coaching',
  COMPUTER_COURSE: 'Computer course',
};

const audienceTone: Record<
  string,
  Parameters<typeof Chip>[0]['tone']
> = {
  ALL: 'brand',
  PARENTS_ONLY: 'accent',
  CLASSROOM: 'info',
  STAFF_ONLY: 'neutral',
  CUSTOM: 'neutral',
};

const audienceLabel: Record<string, string> = {
  ALL: 'Everyone',
  PARENTS_ONLY: 'Parents',
  CLASSROOM: 'Classroom',
  STAFF_ONLY: 'Staff',
  CUSTOM: 'Update',
};

function greeting(d: Date): string {
  const hour = Number(
    d.toLocaleString('en-US', {
      timeZone: 'Asia/Karachi',
      hour: '2-digit',
      hour12: false,
    }),
  );
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}

function whatsappNumber(): string {
  return schoolProfile.whatsapp.replace(/\D/g, '');
}

function whatsappHref(message: string): string {
  return `https://wa.me/${whatsappNumber()}?text=${encodeURIComponent(message)}`;
}

export default async function ParentDashboardPage() {
  const session = await requireRole(['PARENT']);
  const userId = session.user.id;

  const [cards, notifications, announcements] = await Promise.all([
    getParentChildCards(userId),
    getParentNotifications(userId, 8),
    getParentAnnouncements(userId, 3),
  ]);

  const firstName = session.user.name?.split(' ')[0] ?? 'there';
  const today = new Date().toLocaleDateString('en-PK', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const totalOutstanding = cards.reduce((s, c) => s + c.outstandingDues, 0);

  return (
    <>
      <PageHeader
        eyebrow={`${firstName} · ${today}`}
        title={
          cards.length === 1
            ? `${greeting(new Date())}, ${firstName}.`
            : `${greeting(new Date())}, ${firstName}.`
        }
        description={
          cards.length === 0
            ? 'No children are linked to your account yet. Reach out to the school office and we will sort this out.'
            : cards.length === 1
              ? `A quick look at how ${cards[0].firstName} is doing today.`
              : 'A quick look at how everyone is doing today.'
        }
        actions={
          <a
            href={whatsappHref(
              `Hello, I'm ${session.user.name ?? 'a parent'} and would like to speak to the school office.`,
            )}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
            WhatsApp school
          </a>
        }
      />

      {/* Pending fees banner (above the fold when present) */}
      {totalOutstanding > 0 && (
        <Card className="mb-6 border-warn/40 bg-warn-soft/40">
          <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="min-w-0">
              <p className="eyebrow text-warn">Fees pending</p>
              <p
                className="font-display text-2xl text-ink mt-1"
                style={{ fontVariationSettings: '"opsz" 24' }}
              >
                {formatPKR(totalOutstanding)} due
              </p>
              <p className="text-[13px] text-ink-muted mt-1">
                Pay any time on WhatsApp and the office will mark the receipt.
              </p>
            </div>
            <a
              href={whatsappHref(
                `Hello, I'd like to pay the outstanding fees of ${formatPKR(totalOutstanding)} for my child${cards.length > 1 ? 'ren' : ''}.`,
              )}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-[13px] font-semibold text-paper hover:bg-brand-dark transition-colors shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" strokeWidth={2.25} />
              Pay fees on WhatsApp
            </a>
          </div>
        </Card>
      )}

      {/* Child cards */}
      {cards.length > 0 && (
        <section aria-labelledby="children-heading" className="mb-8">
          <h2 id="children-heading" className="sr-only">
            Your children
          </h2>
          <div
            className={
              cards.length === 1
                ? 'grid grid-cols-1 gap-4'
                : 'grid grid-cols-1 md:grid-cols-2 gap-4'
            }
          >
            {cards.map((child) => (
              <Card key={child.id} className="hover:border-line-strong transition-colors">
                <div className="px-6 py-6">
                  <div className="flex items-start gap-4 mb-5">
                    <Avatar name={child.fullName} size="lg" />
                    <div className="min-w-0 flex-1">
                      <p className="eyebrow text-ink-faint">
                        {child.classroomName ?? 'No classroom'}
                        {' · '}
                        <span className="font-mono normal-case tracking-[0.16em]">{child.rollNo}</span>
                      </p>
                      <p
                        className="font-display text-[1.6rem] leading-tight text-ink mt-1"
                        style={{ fontVariationSettings: '"opsz" 48, "SOFT" 50' }}
                      >
                        {child.fullName}
                      </p>
                      {child.programKind && (
                        <p className="text-[12px] text-ink-muted mt-0.5">
                          {programLabel[child.programKind] ?? child.programKind}
                        </p>
                      )}
                    </div>
                  </div>

                  <dl className="grid grid-cols-3 gap-3 mb-5">
                    <Stat
                      label="Attendance"
                      Icon={CalendarCheck}
                      value={formatPercent(child.attendancePct, 0)}
                      hint="30-day"
                    />
                    <Stat
                      label="Pending fees"
                      Icon={Receipt}
                      value={
                        child.outstandingDues > 0
                          ? formatPKR(child.outstandingDues)
                          : '—'
                      }
                      hint={
                        child.outstandingDues > 0 ? 'open invoices' : 'all clear'
                      }
                      tone={child.outstandingDues > 0 ? 'danger' : 'success'}
                    />
                    <Stat
                      label="Homework"
                      Icon={BookOpen}
                      value={String(child.weeklyHomework)}
                      hint="this week"
                    />
                  </dl>

                  <Link
                    href={`/parent/kids/${child.id}`}
                    className="inline-flex items-center justify-between w-full gap-2 rounded-md bg-ink px-4 py-2.5 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors"
                  >
                    View {child.firstName}&rsquo;s details
                    <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <div id="notifications" className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Notifications */}
        <Card className="lg:col-span-2">
          <CardHeader
            eyebrow="Inbox"
            title="Notifications"
            meta={
              notifications.length === 0
                ? "You're all caught up."
                : `${notifications.filter((n) => !n.read).length} unread`
            }
            action={<Bell className="w-4 h-4 text-accent" strokeWidth={1.5} />}
          />
          <NotificationStrip notifications={notifications} />
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader
            eyebrow="From the school"
            title="Announcements"
            action={<Megaphone className="w-4 h-4 text-accent" strokeWidth={1.5} />}
          />
          {announcements.length === 0 ? (
            <div className="px-5 py-8 text-[13px] text-ink-muted italic">
              No announcements right now.
            </div>
          ) : (
            <ul className="divide-y divide-line-soft">
              {announcements.map((a) => (
                <li key={a.id} className="px-5 py-3.5">
                  <div className="flex items-baseline gap-2 mb-1">
                    {a.pinned && <Chip tone="accent">Pinned</Chip>}
                    <Chip tone={audienceTone[a.audience] ?? 'neutral'}>
                      {audienceLabel[a.audience] ?? a.audience}
                    </Chip>
                    <span className="text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
                      {formatDate(a.publishAt, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-[13.5px] text-ink font-semibold leading-snug">
                    {a.title}
                  </p>
                  <p className="text-[12.5px] text-ink-muted leading-snug mt-1 line-clamp-2">
                    {a.body}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <div className="px-5 py-3 border-t border-line-soft">
            <Link
              href="/parent/announcements"
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft hover:text-ink transition-colors"
            >
              See all announcements
              <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
            </Link>
          </div>
        </Card>
      </div>

      {/* School info footer */}
      <Card>
        <CardHeader
          eyebrow="Your school"
          title={schoolProfile.name}
          meta={`Principal · ${schoolProfile.principal}`}
        />
        <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px]">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="eyebrow text-ink-faint mb-1">Address</p>
              <p className="text-ink-soft leading-snug">
                {formatSchoolAddress()}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Phone className="w-4 h-4 text-accent mt-0.5 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="eyebrow text-ink-faint mb-1">Office</p>
              <a
                href={`tel:${schoolProfile.phone.replace(/\s/g, '')}`}
                className="text-ink-soft hover:text-ink transition-colors"
              >
                {schoolProfile.phone}
              </a>
              <p className="text-[11.5px] text-ink-faint mt-1">{schoolProfile.hours}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <MessageCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="eyebrow text-ink-faint mb-1">WhatsApp</p>
              <a
                href={whatsappHref(`Hello, I'm ${session.user.name ?? 'a parent'}.`)}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-ink-soft hover:text-ink transition-colors"
              >
                {schoolProfile.whatsapp}
                <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
              </a>
            </div>
          </div>
        </div>
      </Card>

      <p className="mt-6 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
        <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
        Last updated {relativeTime(new Date().toISOString())}
      </p>
    </>
  );
}

function Stat({
  label,
  value,
  Icon,
  hint,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  hint?: string;
  tone?: 'neutral' | 'success' | 'danger';
}) {
  const valueColor =
    tone === 'danger' ? 'text-danger' : tone === 'success' ? 'text-ink' : 'text-ink';
  return (
    <div className="rounded-md border border-line-soft bg-surface-2 px-3 py-3">
      <p className="eyebrow text-ink-faint inline-flex items-center gap-1.5">
        <Icon className="w-3 h-3" strokeWidth={1.75} />
        {label}
      </p>
      <p
        className={`font-display text-xl ${valueColor} tabular mt-1.5 leading-none`}
        style={{ fontVariationSettings: '"opsz" 24' }}
      >
        {value}
      </p>
      {hint && (
        <p className="text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint mt-1">
          {hint}
        </p>
      )}
    </div>
  );
}
