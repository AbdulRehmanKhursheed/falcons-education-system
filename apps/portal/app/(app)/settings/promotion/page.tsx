import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { requireRole } from '@/lib/auth-helpers';
import {
  getAcademicYears,
  getSourceClassroomsWithCounts,
  getTargetClassrooms,
} from '@/lib/queries/promotion';
import { PromotionWorkflow } from '@/components/data/PromotionWorkflow';
import { loadClassroomsForPromotion } from './_actions';

export const metadata = { title: 'Year-end promotion · Settings' };

export default async function PromotionPage() {
  await requireRole(['SUPER_ADMIN']);

  const years = await getAcademicYears();
  const defaultSourceYear = years.find((y) => y.isCurrent) ?? years[0] ?? null;
  // Pick the most recent year that ISN'T the source as the default target — usually
  // there will only be one or zero candidates at this stage.
  const defaultTargetYear =
    years.find((y) => y.id !== defaultSourceYear?.id) ?? null;

  const [initialSourceClassrooms, initialTargetClassrooms] = await Promise.all([
    defaultSourceYear
      ? getSourceClassroomsWithCounts(defaultSourceYear.id)
      : Promise.resolve([]),
    defaultTargetYear
      ? getTargetClassrooms(defaultTargetYear.id)
      : Promise.resolve([]),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Settings · 06 / Year-end promotion"
        title="Year-end promotion"
        description="Carry students forward to next year's classrooms. Class 6 students graduate out of the school. Restricted to Super Admin."
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

      <div className="mb-6 flex items-start gap-3 p-4 rounded-md border border-warn/30 bg-warn-soft/30 text-[12.5px] text-ink-soft">
        <ShieldAlert className="w-4 h-4 text-warn mt-0.5 shrink-0" strokeWidth={2} />
        <div>
          <p className="font-semibold text-ink">Run once per academic year</p>
          <p className="mt-0.5 max-w-3xl">
            Each step is reviewable. Nothing is written until you confirm the final
            step. The entire promotion executes in a single database transaction —
            on failure, no partial state is committed.
          </p>
        </div>
      </div>

      <PromotionWorkflow
        years={years}
        defaultSourceYearId={defaultSourceYear?.id ?? null}
        initialTargetYearId={defaultTargetYear?.id ?? null}
        initialSourceClassrooms={initialSourceClassrooms}
        initialTargetClassrooms={initialTargetClassrooms}
        loadClassrooms={loadClassroomsForPromotion}
      />
    </>
  );
}
