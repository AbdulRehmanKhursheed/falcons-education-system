import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { TeacherCreateForm } from '@/components/data/TeacherCreateForm';
import { requireRole } from '@/lib/auth-helpers';

export const metadata = { title: 'Add teacher' };

export default async function NewTeacherPage() {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  return (
    <>
      <PageHeader
        eyebrow="Section · 04 / Teachers"
        title="Add teacher"
        description="Create a teacher account with portal access. They'll be able to mark attendance, post homework, and record assessments."
        actions={
          <Link
            href="/teachers"
            className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Back to teachers
          </Link>
        }
      />

      <TeacherCreateForm />
    </>
  );
}
