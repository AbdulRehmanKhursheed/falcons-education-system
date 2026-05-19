import Link from 'next/link';
import {
  CalendarCheck,
  XCircle,
  Clock4,
  PieChart,
  Printer,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { KPI } from '@/components/data/KPI';
import { Card } from '@/components/ui/Card';
import { AttendanceGrid } from '@/components/data/AttendanceGrid';
import {
  getTodayKpis,
  getClassroomsForSelector,
  getRoster,
  getClassroomDailySummary,
  parseISODate,
  todayMidnight,
  toISODate,
} from '@/lib/queries/attendance';
import { formatNumber, formatPercent } from '@/lib/format';
import { requireSession } from '@/lib/auth-helpers';

export const metadata = { title: 'Attendance' };

type SearchParams = {
  classroom?: string;
  date?: string;
};

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireSession();
  const { classroom: classroomParam, date: dateParam } = await searchParams;

  const role = session.user.role;
  const canEdit = role === 'TEACHER' || role === 'SCHOOL_ADMIN' || role === 'SUPER_ADMIN';

  const todayISO = toISODate(todayMidnight());

  // Resolve date. Default = today. Reject malformed inputs silently.
  const dateISO =
    dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayISO;
  const dateObj = parseISODate(dateISO);

  // Load shared data
  const [kpis, classrooms] = await Promise.all([
    getTodayKpis(),
    getClassroomsForSelector(),
  ]);

  // Resolve classroom. Prefer ?classroom=, fall back to first available.
  const initialClassroomId =
    (classroomParam && classrooms.find((c) => c.id === classroomParam)?.id) ||
    classrooms[0]?.id;

  // If there are zero classrooms at all, render an empty hero — nothing else to do.
  if (!initialClassroomId) {
    return (
      <>
        <Header />
        <Card className="p-12 text-center">
          <p
            className="font-display text-2xl text-ink"
            style={{ fontVariationSettings: '"opsz" 24' }}
          >
            No classrooms configured yet.
          </p>
          <p className="mt-2 text-[13.5px] text-ink-soft">
            Add classrooms to the current academic year to start marking attendance.
          </p>
        </Card>
      </>
    );
  }

  const [initialRoster, initialSummary] = await Promise.all([
    getRoster(initialClassroomId, dateObj),
    getClassroomDailySummary(initialClassroomId, dateObj),
  ]);

  const printHref = `/attendance/print?classroom=${encodeURIComponent(initialClassroomId)}&date=${dateISO}`;

  return (
    <>
      <Header printHref={printHref} />

      {/* KPIs — always reflect today, not the selected date. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPI
          label="Attendance today"
          value={formatPercent(kpis.attendancePercent, 1)}
          delta={{
            value: `${formatNumber(kpis.totalMarked)} / ${formatNumber(kpis.totalEnrolled)}`,
            positive: kpis.attendancePercent >= 90,
            suffix: 'marked',
          }}
          Icon={PieChart}
        />
        <KPI
          label="Present today"
          value={formatNumber(kpis.present)}
          delta={{
            value: kpis.late > 0 ? `${formatNumber(kpis.late)}` : '0',
            positive: true,
            suffix: 'late',
          }}
          Icon={CalendarCheck}
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
          label="Late today"
          value={formatNumber(kpis.late)}
          delta={{
            value: formatNumber(kpis.excused),
            positive: true,
            suffix: 'excused',
          }}
          Icon={Clock4}
        />
      </div>

      <AttendanceGrid
        classrooms={classrooms}
        initialClassroomId={initialClassroomId}
        initialDate={dateISO}
        todayISO={todayISO}
        initialRoster={initialRoster}
        initialSummary={initialSummary}
        canEdit={canEdit}
      />
    </>
  );
}

function Header({ printHref }: { printHref?: string } = {}) {
  return (
    <PageHeader
      eyebrow="Section · 02 / Attendance"
      title="Attendance"
      description="Mark today's attendance, browse classroom history, and notify guardians of absences or late arrivals via WhatsApp."
      actions={
        printHref ? (
          <Link
            href={printHref}
            className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
          >
            <Printer className="w-3.5 h-3.5" strokeWidth={2} />
            Print roster
          </Link>
        ) : undefined
      }
    />
  );
}
