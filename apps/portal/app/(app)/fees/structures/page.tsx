import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { FeeStructureManager } from '@/components/data/FeeStructureManager';
import {
  getFeeStructures,
  getClassroomsForFilter,
} from '@/lib/queries/fees';
import { requireRole } from '@/lib/auth-helpers';

export const metadata = { title: 'Fee Structures' };

export default async function FeeStructuresPage() {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const [structures, classrooms] = await Promise.all([
    getFeeStructures(),
    getClassroomsForFilter(),
  ]);

  return (
    <>
      <div className="mb-6 flex items-center gap-2 text-[12.5px] text-ink-muted">
        <Link
          href="/fees"
          className="inline-flex items-center gap-1.5 hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
          Back to fees
        </Link>
      </div>

      <PageHeader
        eyebrow="Section · 03 / Fees · Structures"
        title="Fee structures"
        description="Configure recurring fees per classroom. Active structures drive every month's invoice generation."
      />

      <FeeStructureManager
        initialRows={structures}
        classrooms={classrooms}
      />
    </>
  );
}
