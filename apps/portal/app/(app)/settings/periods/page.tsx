import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { requireRole } from '@/lib/auth-helpers';
import { getAllPeriods } from '@/lib/queries/timetable';
import { PeriodsManager } from '@/components/data/PeriodsManager';
import { db } from '@/lib/db';

export const metadata = { title: 'Periods · Settings' };

export default async function PeriodsPage() {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);
  const [periods, usageCounts] = await Promise.all([
    getAllPeriods(),
    db.timetableEntry.groupBy({
      by: ['periodId'],
      _count: { _all: true },
    }),
  ]);

  const entryCountByPeriodId: Record<string, number> = {};
  for (const u of usageCounts) {
    entryCountByPeriodId[u.periodId] = u._count._all;
  }

  const canMutate =
    session.user.role === 'SUPER_ADMIN' || session.user.role === 'SCHOOL_ADMIN';

  return (
    <>
      <PageHeader
        eyebrow="Settings · 07 / Periods"
        title="Periods"
        description="Daily time blocks used to build classroom timetables. Includes assembly, teaching periods and the mid-morning break."
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

      <PeriodsManager
        rows={periods}
        canMutate={canMutate}
        entryCountByPeriodId={entryCountByPeriodId}
      />
    </>
  );
}
