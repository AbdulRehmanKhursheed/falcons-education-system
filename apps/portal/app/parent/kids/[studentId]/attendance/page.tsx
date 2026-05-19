import { notFound } from 'next/navigation';
import { Card, CardHeader } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/cn';
import { formatPercent, formatDate } from '@/lib/format';
import { requireRole } from '@/lib/auth-helpers';
import {
  assertOwnsStudent,
  getChildAttendance,
  getChildHeader,
} from '@/lib/queries/parent';
import { ChildHeader } from '../_components/ChildHeader';

export const metadata = { title: 'Attendance' };

const statusColor: Record<string, string> = {
  PRESENT: 'bg-success',
  LATE: 'bg-warn',
  ABSENT: 'bg-danger',
  SICK: 'bg-info',
  EXCUSED: 'bg-ink-faint',
};

const statusLabel: Record<string, string> = {
  PRESENT: 'Present',
  LATE: 'Late',
  ABSENT: 'Absent',
  SICK: 'Sick',
  EXCUSED: 'Excused',
};

const absenceTone: Record<string, Parameters<typeof Chip>[0]['tone']> = {
  ABSENT: 'danger',
  SICK: 'info',
  EXCUSED: 'neutral',
};

export default async function ChildAttendancePage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const session = await requireRole(['PARENT']);
  const { studentId } = await params;
  await assertOwnsStudent(session.user.id, studentId);

  const [child, attendance] = await Promise.all([
    getChildHeader(studentId),
    getChildAttendance(studentId),
  ]);
  if (!child) notFound();

  const delta = attendance.attendancePct - attendance.attendancePctPrev;

  return (
    <>
      <ChildHeader child={child} activeTab="attendance" />

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCell
          label="This month"
          value={formatPercent(attendance.attendancePct, 0)}
          hint={
            delta >= 0
              ? `+${delta.toFixed(0)}% vs prior`
              : `${delta.toFixed(0)}% vs prior`
          }
          hintTone={delta >= 0 ? 'success' : 'danger'}
        />
        <KpiCell
          label="Days marked"
          value={String(attendance.totals.marked)}
          hint={`out of ${attendance.windowDays}`}
        />
        <KpiCell
          label="Absent"
          value={String(attendance.totals.absent)}
          hint="last 30 days"
          hintTone={attendance.totals.absent > 0 ? 'danger' : undefined}
        />
        <KpiCell
          label="Late"
          value={String(attendance.totals.late)}
          hint="last 30 days"
          hintTone={attendance.totals.late > 0 ? 'warn' : undefined}
        />
      </div>

      {/* Calendar strip */}
      <Card className="mb-6">
        <CardHeader
          eyebrow="Last 30 days"
          title="Daily attendance"
          meta="Hover any square for the day"
        />
        <div className="px-5 py-5">
          <div
            className="grid gap-[3px]"
            style={{ gridTemplateColumns: 'repeat(30, minmax(0, 1fr))' }}
          >
            {attendance.daily.map((d) => (
              <div
                key={d.date}
                title={`${formatDate(d.date, { weekday: 'short', month: 'short', day: 'numeric' })} · ${d.status ?? 'no record'}`}
                className={cn(
                  'aspect-square rounded-[3px]',
                  d.status ? statusColor[d.status] : 'bg-surface-3',
                )}
              />
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
            <Legend color="bg-success" label={`Present ${attendance.totals.present}`} />
            <Legend color="bg-warn" label={`Late ${attendance.totals.late}`} />
            <Legend color="bg-danger" label={`Absent ${attendance.totals.absent}`} />
            <Legend color="bg-info" label={`Sick ${attendance.totals.sick}`} />
            <Legend color="bg-ink-faint" label={`Excused ${attendance.totals.excused}`} />
            <Legend color="bg-surface-3" label="Unmarked / weekend" />
          </div>
        </div>
      </Card>

      {/* Absences */}
      <Card>
        <CardHeader
          eyebrow="Detail"
          title="Days missed"
          meta={
            attendance.absences.length === 0
              ? 'A perfect run.'
              : `${attendance.absences.length} day${attendance.absences.length === 1 ? '' : 's'} flagged`
          }
        />
        {attendance.absences.length === 0 ? (
          <div className="px-5 py-8 text-[13px] text-ink-muted italic">
            No absences, late marks or sick days in the last 30 days.
          </div>
        ) : (
          <ul className="divide-y divide-line-soft">
            {attendance.absences
              .slice()
              .reverse()
              .map((a) => (
                <li
                  key={a.date}
                  className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Chip tone={absenceTone[a.status]}>{statusLabel[a.status]}</Chip>
                    <p className="text-[13px] text-ink truncate">
                      {formatDate(a.date, {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  {a.remark && (
                    <p className="text-[12px] text-ink-muted sm:max-w-md truncate">
                      &ldquo;{a.remark}&rdquo;
                    </p>
                  )}
                </li>
              ))}
          </ul>
        )}
      </Card>
    </>
  );
}

function KpiCell({
  label,
  value,
  hint,
  hintTone,
}: {
  label: string;
  value: string;
  hint?: string;
  hintTone?: 'success' | 'warn' | 'danger';
}) {
  const tone =
    hintTone === 'success'
      ? 'text-success'
      : hintTone === 'warn'
        ? 'text-warn'
        : hintTone === 'danger'
          ? 'text-danger'
          : 'text-ink-faint';
  return (
    <div className="bg-surface border border-line rounded-lg px-4 py-4">
      <p className="eyebrow text-ink-faint">{label}</p>
      <p
        className="font-display text-[1.75rem] leading-none text-ink tabular tracking-[-0.025em] mt-1.5"
        style={{ fontVariationSettings: '"opsz" 48, "SOFT" 50' }}
      >
        {value}
      </p>
      {hint && <p className={`text-[11px] mt-2 font-semibold tabular ${tone}`}>{hint}</p>}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('w-2.5 h-2.5 rounded-sm', color)} />
      <span>{label}</span>
    </span>
  );
}
