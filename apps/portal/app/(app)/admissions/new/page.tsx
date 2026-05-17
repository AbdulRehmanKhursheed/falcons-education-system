import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { requireRole } from '@/lib/auth-helpers';
import { ApplicationCreateForm } from '@/components/data/ApplicationCreateForm';

export const metadata = { title: 'New application' };

export default async function NewApplicationPage() {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  return (
    <>
      <div className="mb-3">
        <Link
          href="/admissions"
          className="inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint hover:text-ink transition-colors"
        >
          <ChevronLeft className="w-3 h-3" strokeWidth={2} />
          Admissions
        </Link>
      </div>

      <PageHeader
        eyebrow="Admissions · New"
        title="New application"
        description="Capture an inquiry from a parent. The application enters the pipeline at the Received stage and can be moved forward from its detail page."
      />

      <Card className="max-w-3xl">
        <div className="p-6">
          <ApplicationCreateForm />
        </div>
      </Card>
    </>
  );
}
