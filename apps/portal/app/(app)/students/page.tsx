import { Plus, Download, Upload } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StudentsTable } from '@/components/data/StudentsTable';
import { getStudents } from '@/lib/queries/students';
import { requireRole } from '@/lib/auth-helpers';

export const metadata = { title: 'Students' };

export default async function StudentsPage() {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']);

  const { rows, total, classrooms } = await getStudents({
    query: '',
    classroom: 'All',
    take: 50,
    skip: 0,
  });

  return (
    <>
      <PageHeader
        eyebrow="Section · 02 / Students"
        title="Students"
        description="Every child enrolled at Falcons — searchable, filterable, and ready to drill into."
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
            >
              <Upload className="w-3.5 h-3.5" strokeWidth={2} />
              Import
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
            >
              <Download className="w-3.5 h-3.5" strokeWidth={2} />
              Export
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.25} />
              Add student
            </button>
          </>
        }
      />

      <StudentsTable
        initialRows={rows}
        initialTotal={total}
        classrooms={classrooms}
      />
    </>
  );
}
