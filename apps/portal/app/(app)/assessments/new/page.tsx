import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { AssessmentForm } from '@/components/data/AssessmentForm';
import { getStudentsForPicker } from '@/lib/queries/assessments';
import { requireRole } from '@/lib/auth-helpers';

export const metadata = { title: 'New assessment' };

type SearchParams = Promise<{ kind?: string; studentId?: string }>;

function currentTermLabel(now = new Date()): string {
  const m = now.getMonth();
  const year = now.getFullYear();
  const term = m <= 3 ? 1 : m <= 7 ? 2 : 3;
  return `Term ${term} · ${year}`;
}

export default async function NewAssessmentPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']);
  const params = await searchParams;

  const [earlyYearsStudents, primaryStudents] = await Promise.all([
    getStudentsForPicker('early-years'),
    getStudentsForPicker('primary'),
  ]);

  const initialKind =
    params.kind === 'PRIMARY_GRADE' ? 'PRIMARY_GRADE' : 'MONTESSORI_OBSERVATION';

  // If a studentId was provided in the query, pre-fill the picker label.
  let studentLabel = '';
  let studentId = '';
  if (params.studentId) {
    const all = [...earlyYearsStudents, ...primaryStudents];
    const match = all.find((s) => s.id === params.studentId);
    if (match) {
      studentId = match.id;
      studentLabel = `${match.name} · ${match.rollNo}`;
    }
  }

  return (
    <>
      <div className="mb-3">
        <Link
          href="/assessments"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-faint hover:text-ink transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2} />
          Back to assessments
        </Link>
      </div>

      <PageHeader
        eyebrow="Section · 02 / Assessments · New"
        title="Record an assessment"
        description="Switch between a qualitative Montessori observation and a primary grade entry."
      />

      <AssessmentForm
        mode="new"
        earlyYearsStudents={earlyYearsStudents}
        primaryStudents={primaryStudents}
        defaultTerm={currentTermLabel()}
        initial={{
          kind: initialKind,
          studentId,
          studentLabel,
          area: null,
          milestone: null,
          subject: null,
          term: null,
          score: null,
          scoreMax: null,
          grade: null,
          notes: null,
        }}
      />
    </>
  );
}
