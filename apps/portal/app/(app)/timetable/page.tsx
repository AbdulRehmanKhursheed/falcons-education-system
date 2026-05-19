import { CalendarDays, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { KPI } from '@/components/data/KPI';
import { Card } from '@/components/ui/Card';
import { TimetableGrid } from '@/components/data/TimetableGrid';
import { requireRole } from '@/lib/auth-helpers';
import {
  getClassroomsForTimetable,
  getSubjects,
  getTeachersForSelect,
  getTimetableGrid,
  getTimetableKpis,
} from '@/lib/queries/timetable';
import { formatNumber } from '@/lib/format';

export const metadata = { title: 'Timetable' };

type SearchParams = {
  classroom?: string;
};

export default async function TimetablePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireRole([
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'TEACHER',
    'ACCOUNTANT',
  ]);
  const { classroom: classroomParam } = await searchParams;

  const role = session.user.role as
    | 'SUPER_ADMIN'
    | 'SCHOOL_ADMIN'
    | 'TEACHER'
    | 'PARENT'
    | 'ACCOUNTANT';
  const canEdit = role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN';

  const [kpis, classrooms, subjects, teachers] = await Promise.all([
    getTimetableKpis(),
    getClassroomsForTimetable(session.user.id, role),
    getSubjects(),
    getTeachersForSelect(),
  ]);

  // Resolve classroom: prefer ?classroom=, fall back to first available.
  const initialClassroomId =
    (classroomParam && classrooms.find((c) => c.id === classroomParam)?.id) ||
    classrooms[0]?.id;

  if (!initialClassroomId) {
    return (
      <>
        <Header />
        <KpiStrip kpis={kpis} />
        <Card className="p-12 text-center">
          <p
            className="font-display text-2xl text-ink"
            style={{ fontVariationSettings: '"opsz" 24' }}
          >
            {role === 'TEACHER'
              ? 'No homeroom classrooms assigned to you yet.'
              : 'No classrooms configured yet.'}
          </p>
          <p className="mt-2 text-[13.5px] text-ink-soft">
            {role === 'TEACHER'
              ? 'Once a school admin assigns a homeroom to you, the schedule will appear here.'
              : 'Add classrooms to the current academic year to start building timetables.'}
          </p>
        </Card>
      </>
    );
  }

  const initialGrid = await getTimetableGrid(initialClassroomId);

  if (!initialGrid) {
    return (
      <>
        <Header />
        <KpiStrip kpis={kpis} />
        <Card className="p-12 text-center">
          <p
            className="font-display text-2xl text-ink"
            style={{ fontVariationSettings: '"opsz" 24' }}
          >
            Couldn’t load the timetable for that classroom.
          </p>
        </Card>
      </>
    );
  }

  // Default the mobile day-selector to today if it's a workday for this
  // classroom's schedule, else Monday.
  const todayDay = jsDayToWeekday(new Date().getDay());
  const visibleDays = initialGrid.days; // [1..5] or [1..6]
  const initialDay = visibleDays.includes(todayDay) ? todayDay : 1;

  return (
    <>
      <Header />
      <KpiStrip kpis={kpis} />
      <TimetableGrid
        classrooms={classrooms}
        initialClassroomId={initialClassroomId}
        initialGrid={initialGrid}
        initialDay={initialDay}
        todayDay={visibleDays.includes(todayDay) ? todayDay : 0}
        subjects={subjects}
        teachers={teachers}
        canEdit={canEdit}
      />
    </>
  );
}

function Header() {
  return (
    <PageHeader
      eyebrow="Section · 03 / Timetable"
      title="Weekly timetable"
      description="Class schedules at a glance. Admins can click a cell to assign a subject, teacher or note."
    />
  );
}

function KpiStrip({
  kpis,
}: {
  kpis: {
    classroomsWithTimetables: number;
    totalClassrooms: number;
    periods: number;
    subjectsUsed: number;
    unassignedSlots: number;
  };
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <KPI
        label="Classrooms scheduled"
        value={formatNumber(kpis.classroomsWithTimetables)}
        delta={{
          value: `${formatNumber(kpis.totalClassrooms)}`,
          positive: kpis.classroomsWithTimetables >= kpis.totalClassrooms,
          suffix: 'total',
        }}
        Icon={CalendarDays}
      />
      <KPI
        label="Periods configured"
        value={formatNumber(kpis.periods)}
        Icon={Clock}
      />
      <KPI
        label="Subjects on schedule"
        value={formatNumber(kpis.subjectsUsed)}
        Icon={BookOpen}
      />
      <KPI
        label="Unassigned slots"
        value={formatNumber(kpis.unassignedSlots)}
        delta={
          kpis.unassignedSlots > 0
            ? {
                value: 'needs attention',
                positive: false,
              }
            : { value: 'fully scheduled', positive: true }
        }
        Icon={AlertCircle}
      />
    </div>
  );
}

/** JS getDay() is 0=Sun..6=Sat; our schema uses 1=Mon..6=Sat. */
function jsDayToWeekday(jsDay: number): number {
  if (jsDay === 0) return 0; // Sunday → 0 (off)
  return jsDay; // 1..6
}
