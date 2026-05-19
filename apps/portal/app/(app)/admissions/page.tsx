import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { AdmissionsPipeline } from '@/components/data/AdmissionsPipeline';
import { getApplications } from '@/lib/queries/admissions';
import { requireRole } from '@/lib/auth-helpers';

export const metadata = { title: 'Admissions' };

export default async function AdmissionsPage() {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);
  const applications = await getApplications();
  const canMoveStage =
    session.user.role === 'SUPER_ADMIN' || session.user.role === 'SCHOOL_ADMIN';

  return (
    <>
      <PageHeader
        eyebrow="Section · 02 / Admissions"
        title="Admissions pipeline"
        description="Track every application from inquiry through enrollment. Move cards across stages as conversations progress."
        actions={
          <Link
            href="/admissions/new"
            className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.25} />
            New application
          </Link>
        }
      />

      <AdmissionsPipeline
        initialApplications={applications}
        canMoveStage={canMoveStage}
      />
    </>
  );
}
