import Link from 'next/link';
import { Plus, Users, House, BookOpen, BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { KPI } from '@/components/data/KPI';
import { TeachersGrid } from '@/components/data/TeachersGrid';
import { getTeachers, getTeachersKpis } from '@/lib/queries/teachers';
import { formatNumber } from '@/lib/format';
import { requireRole } from '@/lib/auth-helpers';

export const metadata = { title: 'Teachers' };

export default async function TeachersPage() {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const [kpis, list] = await Promise.all([
    getTeachersKpis(),
    getTeachers({ query: '', activeOnly: false, take: 60, skip: 0 }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Section · 04 / Teachers"
        title="Teachers"
        description="Staff records, homeroom assignments, and audit history for every teacher with portal access."
        actions={
          <>
            <Link
              href="/teachers/new"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.25} />
              Add teacher
            </Link>
          </>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPI
          label="Active teachers"
          value={formatNumber(kpis.totalActive)}
          delta={
            kpis.totalInactive > 0
              ? { value: `${kpis.totalInactive}`, positive: false, suffix: 'inactive' }
              : undefined
          }
          Icon={Users}
        />
        <KPI
          label="Homeroom assigned"
          value={formatNumber(kpis.homeroomAssigned)}
          Icon={House}
        />
        <KPI
          label="Classrooms covered"
          value={formatNumber(kpis.classroomsCovered)}
          Icon={BookOpen}
        />
        <KPI
          label="Avg students / teacher"
          value={kpis.avgStudentsPerTeacher.toFixed(1)}
          Icon={BarChart3}
        />
      </div>

      <TeachersGrid initialRows={list.rows} initialTotal={list.total} />
    </>
  );
}
