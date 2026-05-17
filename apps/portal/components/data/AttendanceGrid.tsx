'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  CalendarCheck,
  Clock4,
  XCircle,
  Thermometer,
  ShieldCheck,
  MessageCircle,
  CheckCheck,
  Filter,
  Lock,
  Info,
} from 'lucide-react';
import type { AttendanceStatus } from '@prisma/client';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/cn';
import { formatPercent } from '@/lib/format';
import type { RosterRow, ClassroomDailySummary, ClassroomOption } from '@/lib/queries/attendance';
import {
  markAttendance,
  markAllPresent,
  loadClassroomDay,
} from '@/app/(app)/attendance/_actions';

type ChipTone = Parameters<typeof Chip>[0]['tone'];

const STATUS_META: Record<
  AttendanceStatus,
  {
    label: string;
    short: string;
    tone: ChipTone;
    Icon: typeof CalendarCheck;
    activeClass: string;
    idleClass: string;
  }
> = {
  PRESENT: {
    label: 'Present',
    short: 'P',
    tone: 'success',
    Icon: CalendarCheck,
    activeClass: 'bg-success text-paper border-success',
    idleClass: 'text-ink-soft hover:text-success hover:border-success/40',
  },
  LATE: {
    label: 'Late',
    short: 'L',
    tone: 'warn',
    Icon: Clock4,
    activeClass: 'bg-warn text-paper border-warn',
    idleClass: 'text-ink-soft hover:text-warn hover:border-warn/40',
  },
  ABSENT: {
    label: 'Absent',
    short: 'A',
    tone: 'danger',
    Icon: XCircle,
    activeClass: 'bg-danger text-paper border-danger',
    idleClass: 'text-ink-soft hover:text-danger hover:border-danger/40',
  },
  SICK: {
    label: 'Sick',
    short: 'S',
    tone: 'info',
    Icon: Thermometer,
    activeClass: 'bg-info text-paper border-info',
    idleClass: 'text-ink-soft hover:text-info hover:border-info/40',
  },
  EXCUSED: {
    label: 'Excused',
    short: 'E',
    tone: 'neutral',
    Icon: ShieldCheck,
    activeClass: 'bg-ink text-paper border-ink',
    idleClass: 'text-ink-soft hover:text-ink hover:border-ink-faint',
  },
};

const STATUS_ORDER: AttendanceStatus[] = [
  'PRESENT',
  'LATE',
  'ABSENT',
  'SICK',
  'EXCUSED',
];

type Props = {
  classrooms: ClassroomOption[];
  initialClassroomId: string;
  initialDate: string; // YYYY-MM-DD
  todayISO: string;
  initialRoster: RosterRow[];
  initialSummary: ClassroomDailySummary;
  canEdit: boolean;
};

export function AttendanceGrid({
  classrooms,
  initialClassroomId,
  initialDate,
  todayISO,
  initialRoster,
  initialSummary,
  canEdit,
}: Props) {
  const [classroomId, setClassroomId] = useState(initialClassroomId);
  const [date, setDate] = useState(initialDate);
  const [roster, setRoster] = useState<RosterRow[]>(initialRoster);
  const [summary, setSummary] = useState<ClassroomDailySummary>(initialSummary);
  const [pendingStudentId, setPendingStudentId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeClassroom = useMemo(
    () => classrooms.find((c) => c.id === classroomId) ?? classrooms[0],
    [classrooms, classroomId],
  );

  const isToday = date === todayISO;
  const isFuture = date > todayISO;
  const editable = canEdit && !isFuture;

  function applyResult(next: {
    roster?: RosterRow[];
    summary?: ClassroomDailySummary;
  }) {
    if (next.roster) setRoster(next.roster);
    if (next.summary) setSummary(next.summary);
  }

  function handleClassroomChange(id: string) {
    if (id === classroomId) return;
    setClassroomId(id);
    setGlobalError(null);
    startTransition(async () => {
      try {
        const res = await loadClassroomDay(id, date);
        applyResult(res);
      } catch (err) {
        setGlobalError(messageOf(err));
      }
    });
  }

  function handleDateChange(next: string) {
    if (!next || next === date) return;
    setDate(next);
    setGlobalError(null);
    startTransition(async () => {
      try {
        const res = await loadClassroomDay(classroomId, next);
        applyResult(res);
      } catch (err) {
        setGlobalError(messageOf(err));
      }
    });
  }

  function handleMark(row: RosterRow, status: AttendanceStatus) {
    if (!editable) return;
    if (row.currentStatus === status) return;

    // Optimistic update
    const prevStatus = row.currentStatus;
    setRoster((prev) =>
      prev.map((r) =>
        r.studentId === row.studentId ? { ...r, currentStatus: status } : r,
      ),
    );
    setPendingStudentId(row.studentId);
    setGlobalError(null);

    startTransition(async () => {
      try {
        const res = await markAttendance({
          studentId: row.studentId,
          classroomId,
          date,
          status,
        });
        applyResult({ summary: res.summary });
      } catch (err) {
        // revert
        setRoster((prev) =>
          prev.map((r) =>
            r.studentId === row.studentId
              ? { ...r, currentStatus: prevStatus }
              : r,
          ),
        );
        setGlobalError(messageOf(err));
      } finally {
        setPendingStudentId(null);
      }
    });
  }

  function handleMarkAllPresent() {
    if (!editable) return;
    setGlobalError(null);
    startTransition(async () => {
      try {
        const res = await markAllPresent({ classroomId, date });
        applyResult(res);
      } catch (err) {
        setGlobalError(messageOf(err));
      }
    });
  }

  const dateLabel = useMemo(() => {
    const d = new Date(`${date}T00:00:00`);
    return d.toLocaleDateString('en-PK', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [date]);

  const unmarked = summary.unmarked;
  const noEnrollments = roster.length === 0;

  return (
    <div className="bg-surface border border-line rounded-lg">
      {/* Toolbar: classroom pills + date picker */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-line-soft">
        <div className="flex items-center gap-1 text-[11.5px] font-semibold text-ink-faint">
          <Filter className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span className="uppercase tracking-[0.14em]">Classroom</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {classrooms.map((c) => {
            const active = c.id === classroomId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleClassroomChange(c.id)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition-colors inline-flex items-center gap-1.5',
                  active
                    ? 'bg-ink text-paper border-ink'
                    : 'bg-surface-2 text-ink-soft border-line hover:border-ink-faint hover:text-ink',
                )}
              >
                {c.name}
                <span
                  className={cn(
                    'text-[10px] tabular',
                    active ? 'text-paper/70' : 'text-ink-faint',
                  )}
                >
                  {c.enrolledCount}
                </span>
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
            Date
          </label>
          <input
            type="date"
            value={date}
            max={todayISO}
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-3 py-1.5 rounded-md border border-line bg-surface-2 text-[12.5px] text-ink tabular focus:outline-none focus:border-ink focus:bg-surface transition-colors"
          />
          {!isToday && (
            <span className="text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
              History
            </span>
          )}
        </div>
      </div>

      {/* Header strip: classroom + summary + mark-all */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3.5 border-b border-line-soft bg-surface-2">
        <div className="min-w-0">
          <p className="eyebrow text-ink-faint">{dateLabel}</p>
          <h3
            className="font-display text-[1.05rem] text-ink leading-tight"
            style={{ fontVariationSettings: '"opsz" 24' }}
          >
            {activeClassroom?.name ?? 'Classroom'}
          </h3>
        </div>

        <div className="flex items-center gap-4 text-[12px] text-ink-soft tabular">
          <SummaryStat
            label="Enrolled"
            value={summary.totalEnrolled.toString()}
          />
          <SummaryStat label="Marked" value={summary.marked.toString()} />
          <SummaryStat
            label="Present"
            value={summary.present.toString()}
            tone="success"
          />
          <SummaryStat
            label="Late"
            value={summary.late.toString()}
            tone="warn"
          />
          <SummaryStat
            label="Absent"
            value={summary.absent.toString()}
            tone="danger"
          />
          <SummaryStat
            label="Attendance"
            value={formatPercent(summary.attendancePercent, 1)}
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {!editable && (
            <span className="inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
              <Lock className="w-3 h-3" strokeWidth={1.75} />
              {isFuture ? 'Future date — read-only' : 'Read-only'}
            </span>
          )}

          {editable && (
            <button
              type="button"
              onClick={handleMarkAllPresent}
              disabled={isPending || noEnrollments || unmarked === 0}
              className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:hover:bg-ink"
              title={
                unmarked === 0
                  ? 'Everyone is already marked'
                  : `Mark ${unmarked} unmarked student${unmarked === 1 ? '' : 's'} as present`
              }
            >
              <CheckCheck className="w-3.5 h-3.5" strokeWidth={2.25} />
              Mark all present
              {unmarked > 0 && (
                <span className="text-paper/70 tabular text-[11px]">
                  · {unmarked}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {globalError && (
        <div className="flex items-start gap-2 px-5 py-3 border-b border-line-soft bg-danger-soft text-danger text-[12.5px]">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" strokeWidth={2} />
          <span>{globalError}</span>
        </div>
      )}

      {/* Roster */}
      {noEnrollments ? (
        <EmptyState />
      ) : (
        <ul className="divide-y divide-line-soft">
          {roster.map((row) => (
            <RosterRowItem
              key={row.studentId}
              row={row}
              date={date}
              editable={editable}
              isPending={pendingStudentId === row.studentId}
              onMark={(status) => handleMark(row, status)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Subcomponents ────────────────────────────────────────────────────────

function RosterRowItem({
  row,
  date,
  editable,
  isPending,
  onMark,
}: {
  row: RosterRow;
  date: string;
  editable: boolean;
  isPending: boolean;
  onMark: (status: AttendanceStatus) => void;
}) {
  const showNotify =
    row.currentStatus === 'ABSENT' || row.currentStatus === 'LATE';
  const waNumber = row.guardianWhatsapp || row.guardianPhone;
  const waUrl = showNotify && waNumber ? buildWaUrl(waNumber, row, date) : null;

  return (
    <li
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 hover:bg-surface-2 transition-colors',
        isPending && 'opacity-60',
      )}
    >
      {/* Student info */}
      <div className="flex items-center gap-3 min-w-[200px] flex-1">
        <Avatar name={row.name} size="sm" />
        <div className="min-w-0">
          <p className="font-semibold text-ink text-[13px] truncate">
            {row.name}
          </p>
          <p className="font-mono text-[11px] text-ink-faint tabular truncate">
            {row.rollNo}
            {row.status === 'on-leave' && (
              <span className="ml-2 not-italic">
                <Chip tone="warn">On leave</Chip>
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Status buttons */}
      <div className="flex items-center gap-1">
        {STATUS_ORDER.map((status) => {
          const meta = STATUS_META[status];
          const Icon = meta.Icon;
          const active = row.currentStatus === status;
          return (
            <button
              key={status}
              type="button"
              disabled={!editable || isPending}
              onClick={() => onMark(status)}
              aria-pressed={active}
              aria-label={`Mark ${row.name} ${meta.label}`}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[11.5px] font-semibold transition-all tabular',
                active
                  ? meta.activeClass
                  : `bg-surface-2 border-line ${meta.idleClass}`,
                (!editable || isPending) && 'cursor-not-allowed opacity-60',
              )}
            >
              <Icon className="w-3 h-3" strokeWidth={2} />
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>

      {/* Notify link (visible only on ABSENT/LATE) */}
      <div className="min-w-[160px] text-right">
        {showNotify && waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-line bg-surface text-[11.5px] font-semibold text-success hover:bg-success hover:text-paper hover:border-success transition-colors"
            title={`Notify ${row.guardianName ?? 'guardian'} via WhatsApp`}
          >
            <MessageCircle className="w-3 h-3" strokeWidth={2} />
            Notify guardian
          </a>
        ) : showNotify ? (
          <span className="text-[11px] text-ink-faint italic">
            No guardian phone on file
          </span>
        ) : null}
      </div>
    </li>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'success' | 'warn' | 'danger';
}) {
  const valueClass =
    tone === 'success'
      ? 'text-success'
      : tone === 'warn'
        ? 'text-warn'
        : tone === 'danger'
          ? 'text-danger'
          : 'text-ink';
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
        {label}
      </span>
      <span className={cn('text-[13px] font-semibold tabular', valueClass)}>
        {value}
      </span>
    </span>
  );
}

function EmptyState() {
  return (
    <div className="px-5 py-20 text-center">
      <p
        className="font-display text-xl text-ink"
        style={{ fontVariationSettings: '"opsz" 24' }}
      >
        No students enrolled in this classroom yet.
      </p>
      <p className="mt-1 text-[13px] text-ink-muted">
        Once you enroll students, they will appear here for daily marking.
      </p>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function buildWaUrl(phone: string, row: RosterRow, date: string): string {
  // wa.me expects digits only, no leading + or spaces.
  const digits = phone.replace(/\D/g, '');
  const statusLabel =
    row.currentStatus === 'ABSENT'
      ? 'ABSENT'
      : row.currentStatus === 'LATE'
        ? 'LATE'
        : (row.currentStatus ?? '');
  const friendlyDate = new Date(`${date}T00:00:00`).toLocaleDateString('en-PK', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const text = `Salaam, this is Falcons Education System. ${row.name} was marked ${statusLabel} on ${friendlyDate}.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

function messageOf(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Please try again.';
}
