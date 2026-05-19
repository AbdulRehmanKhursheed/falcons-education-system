import Link from 'next/link';
import {
  Plus,
  BookOpenText,
  CalendarClock,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { KPI } from '@/components/data/KPI';
import { HomeworkList } from '@/components/data/HomeworkList';
import {
  getClassroomsForFilter,
  getHomework,
  getHomeworkKpis,
  getSubjectsForFilter,
  getTeacherHomeroomIds,
} from '@/lib/queries/homework';
import { requireRole } from '@/lib/auth-helpers';

export const metadata = { title: 'Homework' };

type SearchParams = Promise<{
  classroom?: string;
  subject?: string;
  activeOnly?: string;
  query?: string;
}>;

export default async function HomeworkPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']);
  const sp = (await searchParams) ?? {};

  // Teacher scope: only see homework for classrooms they teach.
  const teacherHomerooms =
    session.user.role === 'TEACHER'
      ? await getTeacherHomeroomIds(session.user.id)
      : undefined;

  const classroomId = sp.classroom ?? 'All';
  const subjectId = sp.subject ?? 'All';
  const activeOnly = sp.activeOnly !== 'false';
  const query = sp.query ?? '';

  const [{ rows, total }, kpis, subjects, classrooms] = await Promise.all([
    getHomework({
      query,
      classroomId,
      subjectId,
      activeOnly,
      classroomIds: teacherHomerooms,
    }),
    getHomeworkKpis({ classroomIds: teacherHomerooms }),
    getSubjectsForFilter(),
    getClassroomsForFilter({
      restrictTo:
        session.user.role === 'TEACHER' ? teacherHomerooms : undefined,
    }),
  ]);

  const canPost =
    session.user.role === 'SUPER_ADMIN' ||
    session.user.role === 'SCHOOL_ADMIN' ||
    (session.user.role === 'TEACHER' &&
      (teacherHomerooms?.length ?? 0) > 0);

  return (
    <>
      <PageHeader
        eyebrow="Section · 08 / Homework"
        title="Homework board"
        description="Post assignments by classroom and subject. Parents see updates in the parent portal the moment a homework post goes live."
        actions={
          canPost ? (
            <Link
              href="/homework/new"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.25} />
              Post homework
            </Link>
          ) : null
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPI
          label="Active assignments"
          value={String(kpis.totalActive)}
          Icon={BookOpenText}
        />
        <KPI
          label="Due this week"
          value={String(kpis.dueThisWeek)}
          Icon={CalendarClock}
        />
        <KPI
          label="Overdue"
          value={String(kpis.overdue)}
          Icon={AlertTriangle}
        />
        <KPI
          label="Posted · last 7 days"
          value={String(kpis.postedRecent)}
          Icon={Sparkles}
        />
      </div>

      <HomeworkList
        initialRows={rows}
        initialTotal={total}
        subjects={subjects}
        classrooms={classrooms}
        initialFilters={{
          query,
          classroomId,
          subjectId,
          activeOnly,
        }}
        canPost={canPost}
      />
    </>
  );
}
