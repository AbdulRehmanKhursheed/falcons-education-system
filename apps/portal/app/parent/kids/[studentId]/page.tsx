import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarCheck,
  Receipt,
  BookOpen,
  ClipboardList,
  ArrowUpRight,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { formatPKR, formatPercent, formatDate } from '@/lib/format';
import { requireRole } from '@/lib/auth-helpers';
import {
  assertOwnsStudent,
  getChildOverview,
} from '@/lib/queries/parent';
import { schoolProfile } from '@/lib/school-config';
import { ChildHeader } from './_components/ChildHeader';

export const metadata = { title: 'Child overview' };

const invoiceStatusTone: Record<string, Parameters<typeof Chip>[0]['tone']> = {
  PAID: 'success',
  PARTIALLY_PAID: 'warn',
  ISSUED: 'info',
  OVERDUE: 'danger',
  DRAFT: 'neutral',
  CANCELLED: 'neutral',
};

const invoiceStatusLabel: Record<string, string> = {
  PAID: 'Paid',
  PARTIALLY_PAID: 'Partially paid',
  ISSUED: 'Awaiting payment',
  OVERDUE: 'Overdue',
  DRAFT: 'Draft',
  CANCELLED: 'Cancelled',
};

function whatsappHref(message: string): string {
  return `https://wa.me/${schoolProfile.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}

export default async function ChildOverviewPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const session = await requireRole(['PARENT']);
  const { studentId } = await params;
  await assertOwnsStudent(session.user.id, studentId);

  const overview = await getChildOverview(studentId);
  if (!overview) notFound();

  const { child, attendancePct, attendancePctPrev, totalMarkedLast30, absentLast30, outstandingDues, latestInvoice, upcomingHomework, latestAssessment } = overview;

  const attendanceDelta = attendancePct - attendancePctPrev;

  return (
    <>
      <ChildHeader child={child} activeTab="overview" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Attendance */}
        <Card>
          <CardHeader
            eyebrow="Last 30 days"
            title="Attendance"
            action={<CalendarCheck className="w-4 h-4 text-accent" strokeWidth={1.5} />}
          />
          <div className="px-5 py-5">
            <div className="flex items-baseline justify-between gap-4 mb-3">
              <p
                className="font-display text-[2.5rem] leading-none text-ink tabular tracking-[-0.025em]"
                style={{ fontVariationSettings: '"opsz" 48, "SOFT" 50' }}
              >
                {formatPercent(attendancePct, 0)}
              </p>
              <span
                className={
                  'text-[11.5px] font-semibold tabular ' +
                  (attendanceDelta >= 0 ? 'text-success' : 'text-danger')
                }
              >
                {attendanceDelta >= 0 ? '+' : ''}
                {attendanceDelta.toFixed(0)}% vs prior 30d
              </span>
            </div>
            <p className="text-[13px] text-ink-muted">
              {totalMarkedLast30 > 0
                ? `${totalMarkedLast30} school days marked · ${absentLast30} absent.`
                : 'No attendance records in this window yet.'}
            </p>
            <Link
              href={`/parent/kids/${child.id}/attendance`}
              className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft hover:text-ink"
            >
              See daily timeline <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
            </Link>
          </div>
        </Card>

        {/* Fees */}
        <Card>
          <CardHeader
            eyebrow="Fees"
            title="Account"
            action={<Receipt className="w-4 h-4 text-accent" strokeWidth={1.5} />}
          />
          <div className="px-5 py-5">
            {outstandingDues > 0 ? (
              <>
                <p className="eyebrow text-ink-faint">Outstanding</p>
                <p
                  className="font-display text-[2.5rem] leading-none text-danger tabular tracking-[-0.025em] mt-1"
                  style={{ fontVariationSettings: '"opsz" 48, "SOFT" 50' }}
                >
                  {formatPKR(outstandingDues)}
                </p>
              </>
            ) : (
              <>
                <p className="eyebrow text-ink-faint">Account</p>
                <p
                  className="font-display text-[2rem] leading-none text-success tabular tracking-[-0.025em] mt-1"
                  style={{ fontVariationSettings: '"opsz" 48, "SOFT" 50' }}
                >
                  All clear
                </p>
              </>
            )}

            {latestInvoice && (
              <div className="mt-4 flex items-center justify-between gap-3 text-[12.5px]">
                <div className="min-w-0">
                  <p className="text-ink truncate">
                    Latest · <span className="font-mono tabular">{latestInvoice.monthYear}</span>
                  </p>
                  <p className="text-ink-faint text-[11px] font-mono tabular">
                    {latestInvoice.invoiceNo}
                  </p>
                </div>
                <Chip tone={invoiceStatusTone[latestInvoice.status] ?? 'neutral'}>
                  {invoiceStatusLabel[latestInvoice.status] ?? latestInvoice.status}
                </Chip>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              {outstandingDues > 0 && (
                <a
                  href={whatsappHref(
                    `Hello, I'd like to pay the outstanding fees of ${formatPKR(outstandingDues)} for ${child.fullName} (${child.rollNo}).`,
                  )}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-semibold text-paper hover:bg-brand-dark transition-colors"
                >
                  <MessageCircle className="w-3 h-3" strokeWidth={2} />
                  Pay fees
                </a>
              )}
              <Link
                href={`/parent/kids/${child.id}/fees`}
                className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-[12px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink"
              >
                See invoices
                <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </Card>

        {/* Grades */}
        <Card>
          <CardHeader
            eyebrow="Academics"
            title="Latest assessment"
            action={<Sparkles className="w-4 h-4 text-accent" strokeWidth={1.5} />}
          />
          <div className="px-5 py-5">
            {latestAssessment ? (
              <>
                <p className="text-[12.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
                  {latestAssessment.kind.replace(/_/g, ' ').toLowerCase()}
                </p>
                <p
                  className="font-display text-xl text-ink mt-1 leading-snug"
                  style={{ fontVariationSettings: '"opsz" 24' }}
                >
                  {latestAssessment.summary}
                </p>
                {latestAssessment.detail && (
                  <p className="text-[13px] text-ink-muted mt-1.5 leading-relaxed line-clamp-3">
                    {latestAssessment.detail}
                  </p>
                )}
                <p className="text-[11px] text-ink-faint mt-3">
                  Recorded {formatDate(latestAssessment.assessedAt)}
                </p>
              </>
            ) : (
              <p className="text-[13px] text-ink-muted italic">
                No assessments recorded yet.
              </p>
            )}
            <Link
              href={`/parent/kids/${child.id}/grades`}
              className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft hover:text-ink"
            >
              See all
              <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
            </Link>
          </div>
        </Card>

        {/* Homework */}
        <Card>
          <CardHeader
            eyebrow="Coming up"
            title="Homework"
            action={<BookOpen className="w-4 h-4 text-accent" strokeWidth={1.5} />}
          />
          {upcomingHomework.length === 0 ? (
            <div className="px-5 py-6 text-[13px] text-ink-muted italic">
              No homework due this week — well done.
            </div>
          ) : (
            <ul className="divide-y divide-line-soft">
              {upcomingHomework.map((h) => (
                <li key={h.id} className="px-5 py-3.5">
                  <div className="flex items-baseline gap-2 mb-1">
                    <Chip tone="brand">{h.subject}</Chip>
                    <span className="text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint ml-auto">
                      Due {formatDate(h.dueDate, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-[13px] text-ink leading-snug">{h.title}</p>
                </li>
              ))}
            </ul>
          )}
          <div className="px-5 py-3 border-t border-line-soft">
            <Link
              href={`/parent/kids/${child.id}/homework`}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft hover:text-ink"
            >
              See all homework
              <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
            </Link>
          </div>
        </Card>
      </div>

      {/* Quick links row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickLink
          href={`/parent/kids/${child.id}/attendance`}
          label="Attendance"
          Icon={CalendarCheck}
        />
        <QuickLink
          href={`/parent/kids/${child.id}/fees`}
          label="Fees"
          Icon={Receipt}
        />
        <QuickLink
          href={`/parent/kids/${child.id}/homework`}
          label="Homework"
          Icon={BookOpen}
        />
        <QuickLink
          href={`/parent/kids/${child.id}/timetable`}
          label="Timetable"
          Icon={ClipboardList}
        />
      </div>
    </>
  );
}

function QuickLink({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-2 rounded-lg border border-line bg-surface px-4 py-3 text-[13px] font-semibold text-ink-soft hover:border-line-strong hover:text-ink transition-colors"
    >
      <span className="inline-flex items-center gap-2.5">
        <Icon className="w-4 h-4 text-accent" strokeWidth={1.5} />
        {label}
      </span>
      <ArrowUpRight
        className="w-3.5 h-3.5 text-ink-faint group-hover:text-ink group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
        strokeWidth={2}
      />
    </Link>
  );
}
