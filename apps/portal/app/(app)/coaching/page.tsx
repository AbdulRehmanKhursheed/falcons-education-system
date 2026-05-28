import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { CoachingBatchTable } from '@/components/data/CoachingBatchTable';
import { listBatches } from '@/lib/queries/coaching';
import { requireRole } from '@/lib/auth-helpers';

export const metadata = { title: 'Coaching' };

export default async function CoachingPage() {
  const session = await requireRole([
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'TEACHER',
    'ACCOUNTANT',
  ]);
  const canEdit =
    session.user.role === 'SUPER_ADMIN' ||
    session.user.role === 'SCHOOL_ADMIN' ||
    session.user.role === 'TEACHER';

  const batches = await listBatches();

  return (
    <>
      <PageHeader
        eyebrow="Section · 02 / Coaching"
        title="Coaching batches"
        description="Subject + level + time-slot groups that meet after school. Each batch carries its own roster, attendance, and monthly fee."
        actions={
          canEdit && (
            <Link
              href="/coaching/new"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.25} />
              New batch
            </Link>
          )
        }
      />

      {batches.length === 0 ? (
        <div className="bg-surface border border-line rounded-lg px-6 py-16 text-center">
          <p
            className="font-display text-2xl text-ink"
            style={{ fontVariationSettings: '"opsz" 24' }}
          >
            No coaching batches yet.
          </p>
          <p className="mt-2 text-[13.5px] text-ink-muted max-w-lg mx-auto">
            Create your first batch to start tracking the after-school coaching
            program — assign a teacher, pick weekdays, set a monthly fee.
          </p>
          {canEdit && (
            <div className="mt-5">
              <Link
                href="/coaching/new"
                className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2.25} />
                Create batch
              </Link>
            </div>
          )}
        </div>
      ) : (
        <CoachingBatchTable initialRows={batches} />
      )}
    </>
  );
}
