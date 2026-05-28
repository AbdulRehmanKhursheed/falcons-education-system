import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { requireRole } from '@/lib/auth-helpers';
import { getBatch, listActiveTeachers } from '@/lib/queries/coaching';
import { CoachingBatchForm } from '@/components/data/CoachingBatchForm';

export const metadata = { title: 'Edit coaching batch' };

export default async function EditCoachingBatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']);
  const { id } = await params;

  const [batch, teachers] = await Promise.all([
    getBatch(id),
    listActiveTeachers(),
  ]);
  if (!batch) notFound();

  return (
    <>
      <div className="mb-3">
        <Link
          href={`/coaching/${batch.id}`}
          className="inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint hover:text-ink transition-colors"
        >
          <ChevronLeft className="w-3 h-3" strokeWidth={2} />
          {batch.name}
        </Link>
      </div>

      <PageHeader
        eyebrow="Coaching · Edit"
        title={`Edit · ${batch.name}`}
        description="Update batch details, schedule, capacity, or fee. Use the archive button to retire a batch — historical enrollments are preserved."
      />

      <Card className="max-w-3xl">
        <div className="p-6">
          <CoachingBatchForm
            mode={{ kind: 'edit', batchId: batch.id, isActive: batch.isActive }}
            teachers={teachers}
            initial={{
              name: batch.name,
              subject: batch.subject,
              level: batch.level,
              weekdays: batch.weekdays,
              startTime: batch.startTime,
              endTime: batch.endTime,
              teacherId: batch.teacherId ?? undefined,
              monthlyFee: batch.monthlyFee,
              capacity: batch.capacity,
              notes: batch.notes ?? undefined,
            }}
          />
        </div>
      </Card>
    </>
  );
}
