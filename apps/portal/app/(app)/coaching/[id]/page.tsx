import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ChevronLeft,
  Pencil,
  CalendarCheck,
  Receipt,
  UsersRound,
  Clock,
  GraduationCap,
  Wallet,
  Archive,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { requireRole } from '@/lib/auth-helpers';
import {
  getBatch,
  listAvailableStudents,
} from '@/lib/queries/coaching';
import { CoachingEnrollmentManager } from '@/components/data/CoachingEnrollmentManager';
import { formatPKR } from '@/lib/format';

export const metadata = { title: 'Coaching batch' };

const levelLabel: Record<string, string> = {
  MATRIC_9: 'Matric — Class 9',
  MATRIC_10: 'Matric — Class 10',
  FSC_1: 'FSc — Part 1',
  FSC_2: 'FSc — Part 2',
  O_LEVEL: 'O-Level',
  A_LEVEL: 'A-Level',
  MDCAT: 'MDCAT',
  ECAT: 'ECAT',
  GENERAL: 'General',
};

const weekdayShort: Record<string, string> = {
  MON: 'Mon',
  TUE: 'Tue',
  WED: 'Wed',
  THU: 'Thu',
  FRI: 'Fri',
  SAT: 'Sat',
  SUN: 'Sun',
};

function weekdayOrder(days: readonly string[]): string {
  const order = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  return order
    .filter((d) => days.includes(d))
    .map((d) => weekdayShort[d])
    .join(' · ');
}

export default async function CoachingBatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole([
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'TEACHER',
    'ACCOUNTANT',
  ]);
  const canEdit =
    session.user.role === 'SUPER_ADMIN' ||
    session.user.role === 'SCHOOL_ADMIN' ||
    session.user.role === 'TEACHER';
  const { id } = await params;

  const [batch, availableStudents] = await Promise.all([
    getBatch(id),
    listAvailableStudents(id),
  ]);
  if (!batch) notFound();

  const activeCount = batch.enrollments.filter((e) => e.status === 'ACTIVE').length;
  const pct = batch.capacity > 0 ? (activeCount / batch.capacity) * 100 : 0;
  const capacityTone: Parameters<typeof Chip>[0]['tone'] =
    pct >= 100 ? 'danger' : pct >= 80 ? 'warn' : 'success';

  return (
    <>
      <div className="mb-3">
        <Link
          href="/coaching"
          className="inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint hover:text-ink transition-colors"
        >
          <ChevronLeft className="w-3 h-3" strokeWidth={2} />
          Coaching
        </Link>
      </div>

      <PageHeader
        eyebrow={`Coaching · ${batch.subject} · ${levelLabel[batch.level] ?? batch.level}`}
        title={batch.name}
        description={
          batch.isActive
            ? `${activeCount} of ${batch.capacity} active seats filled. Meets ${weekdayOrder(batch.weekdays).replace(/ · /g, ', ')} from ${batch.startTime} to ${batch.endTime}.`
            : 'Archived batch — no new enrollments will be accepted.'
        }
        actions={
          canEdit && (
            <Link
              href={`/coaching/${batch.id}/edit`}
              className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-ink hover:text-paper hover:border-ink transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
              Edit batch
            </Link>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Summary card */}
        <Card className="lg:col-span-2">
          <CardHeader
            eyebrow="Summary"
            title="Batch details"
            action={
              !batch.isActive ? (
                <Chip tone="neutral">
                  <span className="inline-flex items-center gap-1">
                    <Archive className="w-3 h-3" strokeWidth={2} />
                    Archived
                  </span>
                </Chip>
              ) : (
                <Chip tone="brand">Active</Chip>
              )
            }
          />
          <div className="px-5 py-5">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
              <Field label="Level" Icon={GraduationCap}>
                {levelLabel[batch.level] ?? batch.level}
              </Field>
              <Field label="Subject" Icon={GraduationCap}>
                {batch.subject}
              </Field>
              <Field label="Weekdays" Icon={CalendarCheck}>
                {weekdayOrder(batch.weekdays)}
              </Field>
              <Field label="Time" Icon={Clock}>
                <span className="font-mono tabular">
                  {batch.startTime} – {batch.endTime}
                </span>
              </Field>
              <Field label="Assigned teacher" Icon={UsersRound}>
                {batch.teacherName ?? (
                  <span className="italic text-ink-faint">Unassigned</span>
                )}
              </Field>
              <Field label="Monthly fee" Icon={Wallet}>
                <span className="tabular">{formatPKR(batch.monthlyFee)}</span>
              </Field>
              <Field label="Capacity" Icon={UsersRound}>
                <span className="inline-flex items-center gap-2">
                  <Chip tone={capacityTone}>
                    <span className="tabular">
                      {activeCount}/{batch.capacity}
                    </span>
                  </Chip>
                  <span className="text-ink-faint text-[11.5px]">
                    {batch.enrollments.length} total · {activeCount} active
                  </span>
                </span>
              </Field>
              <Field label="Attendance · 30d" Icon={CalendarCheck}>
                <span className="tabular">{batch.attendanceCount30d}</span>
                <span className="text-ink-faint"> marks</span>
              </Field>
            </dl>

            {batch.notes && (
              <>
                <hr className="my-5 border-line-soft" />
                <h4 className="eyebrow text-ink-faint mb-2">Notes</h4>
                <p className="text-[13px] text-ink-soft whitespace-pre-wrap">
                  {batch.notes}
                </p>
              </>
            )}
          </div>
        </Card>

        {/* Coming-soon actions */}
        <Card>
          <CardHeader
            eyebrow="Operations"
            title="Quick actions"
            meta="Attendance + invoicing"
          />
          <div className="px-5 py-5 space-y-2">
            <button
              type="button"
              disabled
              title="Coming in next deploy"
              className="w-full inline-flex items-center justify-between gap-2 rounded-md border border-line bg-surface-2 px-3.5 py-2.5 text-[12.5px] font-semibold text-ink-soft opacity-60 cursor-not-allowed"
            >
              <span className="inline-flex items-center gap-2">
                <CalendarCheck className="w-3.5 h-3.5" strokeWidth={2} />
                Mark attendance
              </span>
              <span className="eyebrow text-ink-faint">Soon</span>
            </button>
            <button
              type="button"
              disabled
              title="Coming in next deploy"
              className="w-full inline-flex items-center justify-between gap-2 rounded-md border border-line bg-surface-2 px-3.5 py-2.5 text-[12.5px] font-semibold text-ink-soft opacity-60 cursor-not-allowed"
            >
              <span className="inline-flex items-center gap-2">
                <Receipt className="w-3.5 h-3.5" strokeWidth={2} />
                Generate invoices
              </span>
              <span className="eyebrow text-ink-faint">Soon</span>
            </button>
            <p className="text-[11.5px] text-ink-faint pt-1">
              Attendance + coaching invoices land in the next portal release.
            </p>
          </div>
        </Card>
      </div>

      {/* Enrolled students */}
      <Card>
        <CardHeader
          eyebrow="Roster"
          title="Enrolled students"
          meta={`${batch.enrollments.length} total · ${activeCount} active`}
          action={
            <Chip tone={capacityTone}>
              <span className="tabular">
                {activeCount}/{batch.capacity}
              </span>
            </Chip>
          }
        />
        <CoachingEnrollmentManager
          batchId={batch.id}
          isActive={batch.isActive}
          capacity={batch.capacity}
          enrollments={batch.enrollments}
          availableStudents={availableStudents}
          canEdit={canEdit}
        />
      </Card>
    </>
  );
}

function Field({
  label,
  Icon,
  children,
}: {
  label: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="eyebrow text-ink-faint flex items-center gap-1.5">
        <Icon className="w-3 h-3" strokeWidth={1.75} />
        {label}
      </dt>
      <dd className="text-ink mt-0.5">{children}</dd>
    </div>
  );
}
