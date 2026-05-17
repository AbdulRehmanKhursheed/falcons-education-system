import { cn } from '@/lib/cn';
import { formatPercent } from '@/lib/format';
import type { StudentAttendanceSummary } from '@/lib/queries/student-detail';

const statusColors: Record<string, string> = {
  PRESENT: 'bg-success',
  LATE: 'bg-warn',
  ABSENT: 'bg-danger',
  SICK: 'bg-info',
  EXCUSED: 'bg-ink-faint',
};

type Props = { summary: StudentAttendanceSummary };

export function StudentDetailAttendance({ summary }: Props) {
  return (
    <div className="px-5 py-4">
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <div>
          <p className="eyebrow text-ink-faint">Last {summary.windowDays} days</p>
          <p
            className="font-display text-[2rem] leading-none text-ink tabular tracking-[-0.025em] mt-1"
            style={{ fontVariationSettings: '"opsz" 48, "SOFT" 50' }}
          >
            {formatPercent(summary.attendancePct, 0)}
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-success" />
            Present {summary.totals.present}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-warn" />
            Late {summary.totals.late}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-danger" />
            Absent {summary.totals.absent}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-30 gap-[3px]" style={{ gridTemplateColumns: 'repeat(30, minmax(0, 1fr))' }}>
        {summary.daily.map((d) => {
          const color = d.status ? statusColors[d.status] : 'bg-surface-3';
          return (
            <div
              key={d.date}
              title={`${d.date} · ${d.status ?? 'no record'}`}
              className={cn('h-7 rounded-[3px]', color)}
            />
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-ink-faint">
        Hover a square for the day. Empty squares are weekends / unmarked.
      </p>
    </div>
  );
}
