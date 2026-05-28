import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { requireRole } from '@/lib/auth-helpers';
import { listActiveTeachers } from '@/lib/queries/coaching';
import { CoachingBatchForm } from '@/components/data/CoachingBatchForm';

export const metadata = { title: 'New coaching batch' };

export default async function NewCoachingBatchPage() {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']);
  const teachers = await listActiveTeachers();

  return (
    <>
      <div className="mb-3">
        <Link
          href="/coaching"
          className="inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint hover:text-ink transition-colors"
        >
          <ChevronLeft className="w-3 h-3" strokeWidth={2} />
          Coaching
        </Link>
      </div>

      <PageHeader
        eyebrow="Coaching · New"
        title="New coaching batch"
        description="Configure the subject, level, time-slot, and capacity. You can add students from the batch detail page once it's created."
      />

      <Card className="max-w-3xl">
        <div className="p-6">
          <CoachingBatchForm mode={{ kind: 'create' }} teachers={teachers} />
        </div>
      </Card>
    </>
  );
}
