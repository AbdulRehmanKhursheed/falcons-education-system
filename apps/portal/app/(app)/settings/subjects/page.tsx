import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { requireRole } from '@/lib/auth-helpers';
import { getAllSubjects } from '@/lib/queries/timetable';
import { SubjectsManager } from '@/components/data/SubjectsManager';

export const metadata = { title: 'Subjects · Settings' };

export default async function SubjectsPage() {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);
  const subjects = await getAllSubjects();
  const canMutate =
    session.user.role === 'SUPER_ADMIN' || session.user.role === 'SCHOOL_ADMIN';

  return (
    <>
      <PageHeader
        eyebrow="Settings · 06 / Subjects"
        title="Subjects"
        description="Master list of subjects taught at Falcons. Subjects appear in the timetable editor and on assessment reports."
        actions={
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            All settings
          </Link>
        }
      />

      <SubjectsManager rows={subjects} canMutate={canMutate} />
    </>
  );
}
