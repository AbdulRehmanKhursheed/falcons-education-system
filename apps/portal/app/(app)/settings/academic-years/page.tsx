import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { requireRole } from '@/lib/auth-helpers';
import { getAcademicYears } from '@/lib/queries/settings';
import { AcademicYearsManager } from './AcademicYearsManager';

export const metadata = { title: 'Academic Years · Settings' };

export default async function AcademicYearsPage() {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);
  const rows = await getAcademicYears();

  return (
    <>
      <PageHeader
        eyebrow="Settings · 02 / Academic Years"
        title="Academic years"
        description="Add, archive, and mark the current academic session. Only one year can be current at a time."
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

      <AcademicYearsManager rows={rows} />
    </>
  );
}
