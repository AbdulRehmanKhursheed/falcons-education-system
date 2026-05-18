import Link from 'next/link';
import { ChevronLeft, Download } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { requireRole } from '@/lib/auth-helpers';
import { StudentsImportForm } from '@/components/data/StudentsImportForm';

export const metadata = { title: 'Import students' };

const COLUMNS: Array<{ name: string; required: boolean; note?: string }> = [
  { name: 'firstName', required: true },
  { name: 'lastName', required: true },
  { name: 'dateOfBirth', required: true, note: 'YYYY-MM-DD' },
  { name: 'gender', required: true, note: 'male | female | other' },
  { name: 'classroomName', required: true, note: 'must match an existing classroom exactly' },
  { name: 'guardianName', required: true },
  { name: 'guardianRelation', required: true, note: 'Father | Mother | Guardian' },
  { name: 'guardianPhone', required: true, note: '+92 3xx xxxxxxx' },
  { name: 'guardianWhatsapp', required: false },
  { name: 'guardianEmail', required: false },
  { name: 'guardianCnic', required: false, note: 'xxxxx-xxxxxxx-x' },
  { name: 'admissionDate', required: false, note: 'YYYY-MM-DD — defaults to today' },
];

export default async function ImportStudentsPage() {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  return (
    <>
      <div className="mb-3">
        <Link
          href="/students"
          className="inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint hover:text-ink transition-colors"
        >
          <ChevronLeft className="w-3 h-3" strokeWidth={2} />
          All students
        </Link>
      </div>

      <PageHeader
        eyebrow="Students · Import"
        title="Import students from CSV"
        description="Upload your existing roster as a CSV. We'll match guardians by phone, generate roll numbers automatically, and skip any students already on file."
        actions={
          <a
            href="/students/sample.csv"
            download
            className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={2} />
            Sample CSV
          </a>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(280px,340px)]">
        <Card>
          <div className="p-5 sm:p-6">
            <StudentsImportForm />
          </div>
        </Card>

        <Card>
          <div className="p-5 sm:p-6">
            <h3
              className="font-display text-lg text-ink mb-3"
              style={{ fontVariationSettings: '"opsz" 24' }}
            >
              Columns
            </h3>
            <p className="text-[12.5px] text-ink-muted leading-relaxed mb-4">
              First row must be the header. Column order is flexible; missing required columns will be rejected.
            </p>
            <dl className="space-y-2.5">
              {COLUMNS.map((c) => (
                <div key={c.name} className="text-[12.5px]">
                  <dt className="flex items-center gap-1.5 font-mono text-ink">
                    {c.name}
                    {c.required ? (
                      <span className="text-[9.5px] uppercase tracking-[0.14em] font-semibold text-danger">required</span>
                    ) : (
                      <span className="text-[9.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">optional</span>
                    )}
                  </dt>
                  {c.note && (
                    <dd className="text-[11.5px] text-ink-faint mt-0.5 font-mono tabular">{c.note}</dd>
                  )}
                </div>
              ))}
            </dl>
          </div>
        </Card>
      </div>
    </>
  );
}
