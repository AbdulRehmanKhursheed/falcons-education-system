import Link from 'next/link';
import {
  Plus,
  ClipboardList,
  Sparkles,
  AlarmClock,
  Trophy,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { KPI } from '@/components/data/KPI';
import { AssessmentsBrowser } from '@/components/data/AssessmentsBrowser';
import {
  getAssessmentsKpis,
  getMontessoriObservations,
  getPrimaryGrades,
  getClassroomsForFilter,
  getTermsForFilter,
  getSubjectsForFilter,
} from '@/lib/queries/assessments';
import { formatNumber, formatPercent } from '@/lib/format';
import { requireRole } from '@/lib/auth-helpers';

export const metadata = { title: 'Assessments' };

type SearchParams = Promise<{ view?: string }>;

export default async function AssessmentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']);
  const params = await searchParams;
  const initialTab = params.view === 'primary' ? 'primary' : 'montessori';

  const [
    kpis,
    montessori,
    earlyClassrooms,
    primary,
    primaryClassrooms,
    terms,
    subjects,
  ] = await Promise.all([
    getAssessmentsKpis(),
    getMontessoriObservations({ take: 30 }),
    getClassroomsForFilter('early-years'),
    getPrimaryGrades({ take: 100 }),
    getClassroomsForFilter('primary'),
    getTermsForFilter(),
    getSubjectsForFilter(),
  ]);

  const canCreate =
    session.user.role === 'TEACHER' ||
    session.user.role === 'SCHOOL_ADMIN' ||
    session.user.role === 'SUPER_ADMIN';

  return (
    <>
      <PageHeader
        eyebrow="Section · 02 / Assessments"
        title="Assessments"
        description="Qualitative Montessori observations for the early years; structured grades for primary classes."
        actions={
          canCreate && (
            <Link
              href="/assessments/new"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.25} />
              New assessment
            </Link>
          )
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPI
          label={`This term · ${kpis.currentTermLabel}`}
          value={formatNumber(kpis.totalThisTerm)}
          Icon={ClipboardList}
        />
        <KPI
          label="Students assessed · this month"
          value={formatNumber(kpis.studentsAssessedThisMonth)}
          Icon={Sparkles}
        />
        <KPI
          label="Pending · no record in 60 days"
          value={formatNumber(kpis.pendingStudents)}
          delta={
            kpis.pendingStudents > 0
              ? { value: 'follow up', positive: false }
              : undefined
          }
          Icon={AlarmClock}
        />
        <KPI
          label="Avg grade · primary, this term"
          value={kpis.avgGradePct > 0 ? formatPercent(kpis.avgGradePct) : '—'}
          Icon={Trophy}
        />
      </div>

      <AssessmentsBrowser
        initialTab={initialTab}
        montessori={{
          rows: montessori.rows,
          total: montessori.total,
          classrooms: earlyClassrooms,
        }}
        primary={{
          rows: primary.rows,
          total: primary.total,
          classrooms: primaryClassrooms,
          terms,
          subjects,
        }}
      />
    </>
  );
}
