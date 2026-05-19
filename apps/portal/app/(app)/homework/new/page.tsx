import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { HomeworkForm } from '@/components/data/HomeworkForm';
import {
  getClassroomsForFilter,
  getSubjectsForFilter,
  getTeacherHomeroomIds,
} from '@/lib/queries/homework';
import { requireRole } from '@/lib/auth-helpers';

export const metadata = { title: 'Post homework' };

export default async function NewHomeworkPage() {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']);

  // Teachers without a homeroom can't post homework — bounce them.
  let teacherHomerooms: string[] | undefined;
  if (session.user.role === 'TEACHER') {
    teacherHomerooms = await getTeacherHomeroomIds(session.user.id);
    if (teacherHomerooms.length === 0) redirect('/homework');
  }

  const [subjects, classrooms] = await Promise.all([
    getSubjectsForFilter(),
    getClassroomsForFilter({
      restrictTo:
        session.user.role === 'TEACHER' ? teacherHomerooms : undefined,
    }),
  ]);

  return (
    <>
      <div className="mb-3">
        <Link
          href="/homework"
          className="inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint hover:text-ink transition-colors"
        >
          <ChevronLeft className="w-3 h-3" strokeWidth={2} />
          Homework board
        </Link>
      </div>

      <PageHeader
        eyebrow="Section · 08 / Homework"
        title="Post a new assignment"
        description="Assign reading, problems, or projects to a classroom. Parents and students will see this in the parent portal."
      />

      <HomeworkForm mode="new" subjects={subjects} classrooms={classrooms} />
    </>
  );
}
