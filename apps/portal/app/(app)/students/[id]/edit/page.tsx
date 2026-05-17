import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { requireRole } from '@/lib/auth-helpers';
import { getStudentDetail } from '@/lib/queries/student-detail';
import { StudentEditForm } from '@/components/data/StudentEditForm';

export const metadata = { title: 'Edit student' };

export default async function StudentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);
  const { id } = await params;

  const student = await getStudentDetail(id);
  if (!student) notFound();

  return (
    <>
      <div className="mb-3">
        <Link
          href={`/students/${student.id}`}
          className="inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint hover:text-ink transition-colors"
        >
          <ChevronLeft className="w-3 h-3" strokeWidth={2} />
          {student.fullName}
        </Link>
      </div>

      <PageHeader
        eyebrow={`Students · ${student.rollNo}`}
        title="Edit student"
        description="Update profile fields. Roll number and guardian links can't be changed here."
      />

      <Card className="max-w-3xl">
        <div className="p-6">
          <StudentEditForm
            studentId={student.id}
            initial={{
              firstName: student.firstName,
              lastName: student.lastName,
              dateOfBirth: student.dateOfBirth,
              gender: student.gender,
              bloodGroup: student.bloodGroup,
              status: student.status,
              admissionDate: student.admissionDate,
              photoUrl: student.photoUrl,
              notes: student.notes,
            }}
          />
        </div>
      </Card>
    </>
  );
}
