import {
  CalendarCheck,
  Clock4,
  XCircle,
  PieChart,
  Info,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { KPI } from '@/components/data/KPI';
import { StaffAttendanceGrid } from '@/components/data/StaffAttendanceGrid';
import {
  getStaffKpis,
  getStaffRoster,
  parseISODate,
  todayMidnight,
  toISODate,
} from '@/lib/queries/staff-attendance';
import { formatNumber, formatPercent } from '@/lib/format';
import { requireRole } from '@/lib/auth-helpers';

export const metadata = { title: 'Staff attendance' };

type SearchParams = {
  date?: string;
};

export default async function StaffAttendancePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);
  const { date: dateParam } = await searchParams;

  const todayISO = toISODate(todayMidnight());
  const dateISO =
    dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayISO;
  const dateObj = parseISODate(dateISO);

  // KPIs always reflect *today* so the strip is a consistent at-a-glance view.
  const todayObj = todayMidnight();

  const [kpis, initialRoster, initialKpis] = await Promise.all([
    getStaffKpis(todayObj),
    getStaffRoster(dateObj),
    getStaffKpis(dateObj),
  ]);

  const canEdit =
    session.user.role === 'SUPER_ADMIN' || session.user.role === 'SCHOOL_ADMIN';

  // Most Falcons branches run a Mon–Sat week; Sunday on the date picker is
  // almost always an accidental selection.
  const isWeekend = dateObj.getDay() === 0;

  return (
    <>
      <PageHeader
        eyebrow="Section · 02 / Staff attendance"
        title="Staff attendance"
        description="Daily roster for teachers, admins, and accountants. Mark today's attendance or browse history. Restricted to school administration."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPI
          label="Present today"
          value={formatNumber(kpis.present)}
          delta={{
            value: `${formatNumber(kpis.present)} / ${formatNumber(kpis.totalStaff)}`,
            positive: kpis.present >= Math.ceil(kpis.totalStaff * 0.9),
            suffix: 'staff',
          }}
          Icon={CalendarCheck}
        />
        <KPI
          label="Late today"
          value={formatNumber(kpis.late)}
          delta={{
            value: formatNumber(kpis.excused),
            positive: kpis.late === 0,
            suffix: 'excused',
          }}
          Icon={Clock4}
        />
        <KPI
          label="Absent today"
          value={formatNumber(kpis.absent)}
          delta={{
            value: formatNumber(kpis.sick),
            positive: kpis.absent === 0,
            suffix: 'sick',
          }}
          Icon={XCircle}
        />
        <KPI
          label="Attendance · 7-day"
          value={formatPercent(kpis.attendancePercent, 1)}
          delta={{
            value: formatNumber(kpis.totalStaff),
            positive: kpis.attendancePercent >= 90,
            suffix: 'on staff',
          }}
          Icon={PieChart}
        />
      </div>

      {isWeekend && (
        <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-line-soft bg-surface-2 px-4 py-3 text-[13px] text-ink-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" strokeWidth={1.75} />
          <span>
            <span className="font-semibold text-ink">Sunday selected.</span>{' '}
            The school is normally closed on Sundays — double-check the date
            before saving attendance.
          </span>
        </div>
      )}

      <StaffAttendanceGrid
        initialDate={dateISO}
        todayISO={todayISO}
        initialRoster={initialRoster}
        initialKpis={initialKpis}
        canEdit={canEdit}
      />
    </>
  );
}
