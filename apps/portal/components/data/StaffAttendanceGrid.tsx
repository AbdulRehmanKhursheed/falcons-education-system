'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  CalendarCheck,
  Clock4,
  XCircle,
  Thermometer,
  ShieldCheck,
  CheckCheck,
  Lock,
  Info,
  MessageSquare,
} from 'lucide-react';
import type { AttendanceStatus, Role } from '@prisma/client';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/cn';
import { formatPercent } from '@/lib/format';
import type { StaffRosterRow, StaffKpis } from '@/lib/queries/staff-attendance';
import {
  markStaffAttendance,
  markAllStaffPresent,
  loadStaffRoster,
} from '@/app/(app)/staff-attendance/_actions';

type ChipTone = Parameters<typeof Chip>[0]['tone'];

const STATUS_META: Record<
  AttendanceStatus,
  {
    label: string;
    tone: ChipTone;
    Icon: typeof CalendarCheck;
    activeClass: string;
    idleClass: string;
  }
> = {
  PRESENT: {
    label: 'Present',
    tone: 'success',
    Icon: CalendarCheck,
    activeClass: 'bg-success text-paper border-success',
    idleClass: 'text-ink-soft hover:text-success hover:border-success/40',
  },
  LATE: {
    label: 'Late',
    tone: 'warn',
    Icon: Clock4,
    activeClass: 'bg-warn text-paper border-warn',
    idleClass: 'text-ink-soft hover:text-warn hover:border-warn/40',
  },
  ABSENT: {
    label: 'Absent',
    tone: 'danger',
    Icon: XCircle,
    activeClass: 'bg-danger text-paper border-danger',
    idleClass: 'text-ink-soft hover:text-danger hover:border-danger/40',
  },
  SICK: {
    label: 'Sick',
    tone: 'info',
    Icon: Thermometer,
    activeClass: 'bg-info text-paper border-info',
    idleClass: 'text-ink-soft hover:text-info hover:border-info/40',
  },
  EXCUSED: {
    label: 'Excused',
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

const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  SCHOOL_ADMIN: 'School Admin',
  TEACHER: 'Teacher',
  ACCOUNTANT: 'Accountant',
  PARENT: 'Parent',
};

const ROLE_TONE: Record<Role, ChipTone> = {
  SUPER_ADMIN: 'brand',
  SCHOOL_ADMIN: 'brand',
  TEACHER: 'accent',
  ACCOUNTANT: 'info',
  PARENT: 'neutral',
};

type Props = {
  initialDate: string; // YYYY-MM-DD
  todayISO: string;
  initialRoster: StaffRosterRow[];
  initialKpis: StaffKpis;
  canEdit: boolean;
};

export function StaffAttendanceGrid({
  initialDate,
  todayISO,
  initialRoster,
  initialKpis,
  canEdit,
}: Props) {
  const [date, setDate] = useState(initialDate);
  const [roster, setRoster] = useState<StaffRosterRow[]>(initialRoster);
  const [kpis, setKpis] = useState<StaffKpis>(initialKpis);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [openRemarkFor, setOpenRemarkFor] = useState<string | null>(null);
  const [remarkDraft, setRemarkDraft] = useState('');
  const [isPending, startTransition] = useTransition();

  const isToday = date === todayISO;
  const isFuture = date > todayISO;
  const editable = canEdit && !isFuture;

  const unmarked = useMemo(() => {
    return roster.filter((r) => r.currentStatus === null).length;
  }, [roster]);

  function handleDateChange(next: string) {
    if (!next || next === date) return;
    setDate(next);
    setGlobalError(null);
    setOpenRemarkFor(null);
    startTransition(async () => {
      try {
        const res = await loadStaffRoster(next);
        setRoster(res.roster);
        setKpis(res.kpis);
      } catch (err) {
        setGlobalError(messageOf(err));
      }
    });
  }

  function handleMark(row: StaffRosterRow, status: AttendanceStatus) {
    if (!editable) return;
    if (row.currentStatus === status) return;

    const prevStatus = row.currentStatus;
    setRoster((prev) =>
      prev.map((r) =>
        r.userId === row.userId ? { ...r, currentStatus: status } : r,
      ),
    );
    setPendingUserId(row.userId);
    setGlobalError(null);

    startTransition(async () => {
      try {
        const res = await markStaffAttendance({
          userId: row.userId,
          date,
          status,
          remark: row.remark ?? undefined,
        });
        setKpis(res.kpis);
      } catch (err) {
        // revert
        setRoster((prev) =>
          prev.map((r) =>
            r.userId === row.userId ? { ...r, currentStatus: prevStatus } : r,
          ),
        );
        setGlobalError(messageOf(err));
      } finally {
        setPendingUserId(null);
      }
    });
  }

  function handleSaveRemark(row: StaffRosterRow) {
    if (!editable) return;
    if (!row.currentStatus) {
      setGlobalError('Mark a status before adding a remark.');
      return;
    }
    const trimmed = remarkDraft.trim();
    const prevRemark = row.remark;
    setRoster((prev) =>
      prev.map((r) =>
        r.userId === row.userId ? { ...r, remark: trimmed || null } : r,
      ),
    );
    setPendingUserId(row.userId);
    setGlobalError(null);
    setOpenRemarkFor(null);

    startTransition(async () => {
      try {
        await markStaffAttendance({
          userId: row.userId,
          date,
          status: row.currentStatus!,
          remark: trimmed,
        });
      } catch (err) {
        // revert
        setRoster((prev) =>
          prev.map((r) =>
            r.userId === row.userId ? { ...r, remark: prevRemark } : r,
          ),
        );
        setGlobalError(messageOf(err));
      } finally {
        setPendingUserId(null);
      }
    });
  }

  function handleMarkAllPresent() {
    if (!editable) return;
    setGlobalError(null);
    startTransition(async () => {
      try {
        const res = await markAllStaffPresent({ date });
        setRoster(res.roster);
        setKpis(res.kpis);
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

  const noStaff = roster.length === 0;

  return (
    <div className="bg-surface border border-line rounded-lg">
      {/* Toolbar: date picker + mark-all */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4 border-b border-line-soft">
        <div className="min-w-0">
          <p className="eyebrow text-ink-faint">{dateLabel}</p>
          <h3
            className="font-display text-[1.05rem] text-ink leading-tight"
            style={{ fontVariationSettings: '"opsz" 24' }}
          >
            Staff roster
          </h3>
        </div>

        <div className="flex items-center gap-4 text-[12px] text-ink-soft tabular">
          <SummaryStat label="On staff" value={kpis.totalStaff.toString()} />
          <SummaryStat
            label="Present"
            value={kpis.present.toString()}
            tone="success"
          />
          <SummaryStat
            label="Late"
            value={kpis.late.toString()}
            tone="warn"
          />
          <SummaryStat
            label="Absent"
            value={kpis.absent.toString()}
            tone="danger"
          />
          <SummaryStat
            label="7-day"
            value={formatPercent(kpis.attendancePercent, 1)}
          />
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
          {!editable && (
            <span className="inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
              <Lock className="w-3 h-3" strokeWidth={1.75} />
              {isFuture ? 'Future date' : 'Read-only'}
            </span>
          )}

          {editable && (
            <button
              type="button"
              onClick={handleMarkAllPresent}
              disabled={isPending || noStaff || unmarked === 0}
              className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:hover:bg-ink"
              title={
                unmarked === 0
                  ? 'Everyone is already marked'
                  : `Mark ${unmarked} unmarked staff as present`
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
      {noStaff ? (
        <EmptyState />
      ) : (
        <ul className="divide-y divide-line-soft">
          {roster.map((row) => (
            <StaffRosterRowItem
              key={row.userId}
              row={row}
              editable={editable}
              isPending={pendingUserId === row.userId}
              remarkOpen={openRemarkFor === row.userId}
              remarkDraft={openRemarkFor === row.userId ? remarkDraft : row.remark ?? ''}
              onOpenRemark={() => {
                setOpenRemarkFor(row.userId);
                setRemarkDraft(row.remark ?? '');
              }}
              onCancelRemark={() => {
                setOpenRemarkFor(null);
                setRemarkDraft('');
              }}
              onRemarkChange={setRemarkDraft}
              onSaveRemark={() => handleSaveRemark(row)}
              onMark={(status) => handleMark(row, status)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Subcomponents ────────────────────────────────────────────────────────

function StaffRosterRowItem({
  row,
  editable,
  isPending,
  remarkOpen,
  remarkDraft,
  onOpenRemark,
  onCancelRemark,
  onRemarkChange,
  onSaveRemark,
  onMark,
}: {
  row: StaffRosterRow;
  editable: boolean;
  isPending: boolean;
  remarkOpen: boolean;
  remarkDraft: string;
  onOpenRemark: () => void;
  onCancelRemark: () => void;
  onRemarkChange: (v: string) => void;
  onSaveRemark: () => void;
  onMark: (status: AttendanceStatus) => void;
}) {
  return (
    <li
      className={cn(
        'px-5 py-3 hover:bg-surface-2 transition-colors',
        isPending && 'opacity-60',
      )}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {/* Staff info */}
        <div className="flex items-center gap-3 min-w-[200px] flex-1">
          <Avatar name={row.name} size="sm" />
          <div className="min-w-0">
            <p className="font-semibold text-ink text-[13px] truncate">
              {row.name}
            </p>
            <p className="font-mono text-[11px] text-ink-faint tabular truncate">
              {row.email}
            </p>
          </div>
          <Chip tone={ROLE_TONE[row.role]}>{ROLE_LABEL[row.role]}</Chip>
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

        {/* Remark toggle */}
        <div className="min-w-[120px] text-right">
          <button
            type="button"
            onClick={() => (remarkOpen ? onCancelRemark() : onOpenRemark())}
            disabled={!editable || isPending}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[11.5px] font-semibold transition-colors',
              row.remark
                ? 'border-line bg-surface-2 text-ink hover:bg-surface-3'
                : 'border-line bg-surface text-ink-soft hover:bg-surface-3 hover:text-ink',
              (!editable || isPending) && 'cursor-not-allowed opacity-60',
            )}
            title={row.remark ?? 'Add remark'}
          >
            <MessageSquare className="w-3 h-3" strokeWidth={2} />
            {row.remark ? 'Edit note' : 'Note'}
          </button>
        </div>
      </div>

      {/* Inline remark editor */}
      {remarkOpen && (
        <div className="mt-3 ml-12 flex flex-wrap gap-2 items-start">
          <textarea
            value={remarkDraft}
            onChange={(e) => onRemarkChange(e.target.value)}
            rows={2}
            placeholder="Reason, context, or expected return…"
            className="flex-1 min-w-[260px] rounded-md border border-line bg-surface-2 px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink focus:bg-surface transition-colors resize-y"
          />
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={onSaveRemark}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-60"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancelRemark}
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-[12px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing remark preview when closed */}
      {!remarkOpen && row.remark && (
        <p className="mt-1.5 ml-12 text-[12px] text-ink-soft italic">
          “{row.remark}”
        </p>
      )}
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
        No active staff users.
      </p>
      <p className="mt-1 text-[13px] text-ink-muted">
        Add teachers, admins, or accountants from User management to start
        marking staff attendance.
      </p>
    </div>
  );
}

function messageOf(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Please try again.';
}
