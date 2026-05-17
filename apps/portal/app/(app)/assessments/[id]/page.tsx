import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Pencil, CalendarDays, User, BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import { AssessmentForm } from '@/components/data/AssessmentForm';
import { AssessmentDeleteButton } from '@/components/data/AssessmentDeleteButton';
import {
  getAssessment,
  getStudentsForPicker,
} from '@/lib/queries/assessments';
import { formatDate } from '@/lib/format';
import { requireRole } from '@/lib/auth-helpers';

export const metadata = { title: 'Assessment detail' };

type RouteParams = Promise<{ id: string }>;
type SearchParams = Promise<{ edit?: string }>;

const gradeTone: Record<string, Parameters<typeof Chip>[0]['tone']> = {
  'A+': 'success',
  A: 'success',
  'B+': 'info',
  B: 'info',
  C: 'warn',
  F: 'danger',
};

function currentTermLabel(now = new Date()): string {
  const m = now.getMonth();
  const year = now.getFullYear();
  const term = m <= 3 ? 1 : m <= 7 ? 2 : 3;
  return `Term ${term} · ${year}`;
}

export default async function AssessmentDetailPage({
  params,
  searchParams,
}: {
  params: RouteParams;
  searchParams: SearchParams;
}) {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']);
  const { id } = await params;
  const { edit } = await searchParams;

  const assessment = await getAssessment(id);
  if (!assessment) notFound();

  const isEditing = edit === '1';
  const role = session.user.role;
  const canDelete = role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN';
  const canEdit =
    role === 'SUPER_ADMIN' ||
    role === 'SCHOOL_ADMIN' ||
    (role === 'TEACHER' && assessment.assessedById === session.user.id);

  // For edit mode, ship the picker data the form needs.
  let earlyYearsStudents: Awaited<ReturnType<typeof getStudentsForPicker>> = [];
  let primaryStudents: typeof earlyYearsStudents = [];
  if (isEditing && canEdit) {
    [earlyYearsStudents, primaryStudents] = await Promise.all([
      getStudentsForPicker('early-years'),
      getStudentsForPicker('primary'),
    ]);
  }

  const kindLabel =
    assessment.kind === 'MONTESSORI_OBSERVATION'
      ? 'Montessori observation'
      : assessment.kind === 'PRIMARY_GRADE'
        ? 'Primary grade'
        : 'Progress note';

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
        eyebrow={`Section · 02 / Assessments · ${kindLabel}`}
        title={
          isEditing
            ? `Edit · ${assessment.studentName}`
            : assessment.kind === 'PRIMARY_GRADE'
              ? `${assessment.subject ?? 'Grade'} · ${assessment.studentName}`
              : assessment.milestone ?? assessment.studentName
        }
        description={
          assessment.classroom
            ? `${assessment.classroom} · Recorded by ${assessment.assessedByName}`
            : `Recorded by ${assessment.assessedByName}`
        }
        actions={
          !isEditing && (
            <>
              {canEdit && (
                <Link
                  href={`/assessments/${assessment.id}?edit=1`}
                  className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
                  Edit
                </Link>
              )}
              {canDelete && <AssessmentDeleteButton id={assessment.id} />}
            </>
          )
        }
      />

      {isEditing && canEdit ? (
        <AssessmentForm
          mode="edit"
          assessmentId={assessment.id}
          earlyYearsStudents={earlyYearsStudents}
          primaryStudents={primaryStudents}
          defaultTerm={currentTermLabel()}
          initial={{
            kind:
              assessment.kind === 'PRIMARY_GRADE'
                ? 'PRIMARY_GRADE'
                : 'MONTESSORI_OBSERVATION',
            studentId: assessment.studentId,
            studentLabel: `${assessment.studentName} · ${assessment.rollNo}`,
            area: assessment.area,
            milestone: assessment.milestone,
            subject: assessment.subject,
            term: assessment.term,
            score: assessment.score,
            scoreMax: assessment.scoreMax,
            grade: assessment.grade,
            notes: assessment.notes,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 p-5 space-y-6">
            {assessment.kind === 'PRIMARY_GRADE' ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <KvBlock label="Subject" value={assessment.subject ?? '—'} />
                  <KvBlock label="Term" value={assessment.term ?? '—'} />
                  <KvBlock
                    label="Score"
                    value={
                      assessment.score !== null && assessment.scoreMax !== null
                        ? `${assessment.score} / ${assessment.scoreMax}`
                        : '—'
                    }
                    sub={
                      assessment.scorePct !== null
                        ? `${assessment.scorePct.toFixed(1)}%`
                        : undefined
                    }
                  />
                  <KvBlock
                    label="Grade"
                    value={
                      assessment.grade ? (
                        <Chip tone={gradeTone[assessment.grade] ?? 'neutral'}>
                          {assessment.grade}
                        </Chip>
                      ) : (
                        '—'
                      )
                    }
                  />
                </div>

                {assessment.notes && (
                  <section>
                    <p className="eyebrow text-ink-faint mb-2">Teacher remarks</p>
                    <p className="text-[14px] text-ink leading-relaxed whitespace-pre-wrap">
                      {assessment.notes}
                    </p>
                  </section>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  {assessment.area && (
                    <Chip tone="brand">{assessment.area}</Chip>
                  )}
                  {assessment.term && (
                    <span className="text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
                      {assessment.term}
                    </span>
                  )}
                </div>

                <section>
                  <p className="eyebrow text-ink-faint mb-2">Milestone</p>
                  <p
                    className="font-display text-2xl text-ink leading-snug"
                    style={{ fontVariationSettings: '"opsz" 48' }}
                  >
                    {assessment.milestone ?? '—'}
                  </p>
                </section>

                {assessment.notes && (
                  <section>
                    <p className="eyebrow text-ink-faint mb-2">Notes</p>
                    <p className="text-[14px] text-ink leading-relaxed whitespace-pre-wrap">
                      {assessment.notes}
                    </p>
                  </section>
                )}
              </>
            )}
          </Card>

          <Card className="p-5 space-y-4">
            <section>
              <p className="eyebrow text-ink-faint mb-3">Student</p>
              <div className="flex items-center gap-3">
                <Avatar name={assessment.studentName} size="md" />
                <div className="min-w-0">
                  <p className="font-semibold text-ink truncate">
                    {assessment.studentName}
                  </p>
                  <p className="font-mono text-[11.5px] text-ink-faint tabular">
                    {assessment.rollNo}
                  </p>
                  <p className="text-[12px] text-ink-soft mt-0.5">
                    {assessment.classroom ?? '—'}
                  </p>
                </div>
              </div>
            </section>

            <hr className="border-line-soft" />

            <ul className="space-y-3 text-[12.5px]">
              <li className="flex items-center gap-2.5 text-ink-soft">
                <BookOpen className="w-3.5 h-3.5 text-ink-faint" strokeWidth={1.75} />
                <span>{kindLabel}</span>
              </li>
              <li className="flex items-center gap-2.5 text-ink-soft">
                <CalendarDays className="w-3.5 h-3.5 text-ink-faint" strokeWidth={1.75} />
                <span>
                  {formatDate(assessment.assessedAt, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </li>
              <li className="flex items-center gap-2.5 text-ink-soft">
                <User className="w-3.5 h-3.5 text-ink-faint" strokeWidth={1.75} />
                <span>{assessment.assessedByName}</span>
              </li>
            </ul>
          </Card>
        </div>
      )}
    </>
  );
}

function KvBlock({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div>
      <p className="eyebrow text-ink-faint mb-1.5">{label}</p>
      <div
        className="font-display text-xl text-ink leading-tight"
        style={{ fontVariationSettings: '"opsz" 24' }}
      >
        {value}
      </div>
      {sub && (
        <p className="text-[11.5px] text-ink-faint tabular mt-1">{sub}</p>
      )}
    </div>
  );
}
