import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { requireRole } from '@/lib/auth-helpers';
import { getClassroomsForEnrollment } from '@/lib/queries/student-detail';
import { StudentCreateForm } from '@/components/data/StudentCreateForm';

export const metadata = { title: 'New student' };

export default async function NewStudentPage() {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const classrooms = await getClassroomsForEnrollment();

  return (
    <>
      <div className="mb-3">
        <Link
          href="/students"
          className="inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint hover:text-ink transition-colors"
        >
          <ChevronLeft className="w-3 h-3" strokeWidth={2} />
          All students
        </Link>
      </div>

      <PageHeader
        eyebrow="Students · New"
        title="Add a student"
        description="Create a student record. Roll number is assigned automatically (FES-YYYY-NNN). Link an existing guardian by phone or create one inline."
      />

      <Card className="max-w-4xl">
        <div className="p-6">
          <StudentCreateForm classrooms={classrooms} />
        </div>
      </Card>
    </>
  );
}
