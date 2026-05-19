/**
 * Per-student term-end report card · A4 print page.
 *
 * URL: `/students/[id]/report-card?term=Term%201%20%C2%B7%202026`
 *
 * Uses a query param rather than a `[term]/page.tsx` dynamic segment because
 * the canonical term label contains the middle-dot character ("·") and
 * percent-encoded segments are fragile.
 *
 * Reuses the print pattern from `/students/[id]/print/page.tsx` — same
 * `@media print` rules to hide sidebar/topbar and lay out for A4.
 */

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PrintTriggerButton } from '@/components/data/PrintTriggerButton';
import { ReportCardLayout } from '@/components/data/ReportCardLayout';
import { requireRole } from '@/lib/auth-helpers';
import {
  getReportCardData,
  getStudentTerms,
} from '@/lib/queries/report-card';
import { db } from '@/lib/db';

export const metadata = { title: 'Report card' };

type SearchParams = Promise<{ term?: string }>;

export default async function StudentReportCardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']);
  const { id } = await params;
  const { term: requestedTerm } = (await searchParams) ?? {};

  // Fall back to the most recent term if none requested.
  const allTerms = await getStudentTerms(id);
  const term = requestedTerm ?? allTerms[0];
  if (!term) notFound();

  const data = await getReportCardData(id, term);
  if (!data) notFound();

  // Teacher access — match the student detail page's homeroom gate.
  if (session.user.role === 'TEACHER') {
    const teacher = await db.teacher.findUnique({
      where: { userId: session.user.id },
      select: { homerooms: { select: { id: true } } },
    });
    const allowed = new Set(teacher?.homerooms.map((c) => c.id) ?? []);
    if (
      !data.student.classroomId ||
      !allowed.has(data.student.classroomId)
    ) {
      notFound();
    }
  }

  // If the requested term doesn't have any data, redirect to the latest term we
  // *do* have data for — avoids printing an empty card when a typo'd term slips
  // through the URL.
  if (
    !data.isMontessori &&
    data.primary.rows.length === 0 &&
    data.observations.length === 0 &&
    allTerms.length > 0 &&
    allTerms[0] !== term
  ) {
    redirect(
      `/students/${id}/report-card?term=${encodeURIComponent(allTerms[0])}`,
    );
  }

  return (
    <>
      {/* Print-only CSS — matches `/students/[id]/print/page.tsx` */}
      <style>{`
        @media print {
          @page { size: A4; margin: 14mm; }
          html, body { background: #ffffff !important; }
          aside, header.sticky, .no-print { display: none !important; }
          main { padding: 0 !important; }
          .print-sheet {
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
            max-width: 100% !important;
            padding: 0 !important;
            font-size: 12pt;
          }
          .print-sheet h1, .print-sheet h2 { color: #000 !important; }
          .print-sheet table { page-break-inside: auto; }
          .print-sheet tr { page-break-inside: avoid; page-break-after: auto; }
          .print-sheet section { page-break-inside: avoid; }
        }
      `}</style>

      {/* On-screen toolbar — hidden on print */}
      <div className="no-print mb-6 flex items-center justify-between gap-3">
        <Link
          href={`/students/${id}`}
          className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
          Back to student
        </Link>

        <div className="flex items-center gap-2">
          {allTerms.length > 1 && (
            <TermPicker
              studentId={id}
              terms={allTerms}
              activeTerm={term}
            />
          )}
          <PrintTriggerButton />
        </div>
      </div>

      <ReportCardLayout data={data} />
    </>
  );
}

function TermPicker({
  studentId,
  terms,
  activeTerm,
}: {
  studentId: string;
  terms: string[];
  activeTerm: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="eyebrow text-ink-faint mr-1">Term</span>
      {terms.map((t) => {
        const active = t === activeTerm;
        const href = `/students/${studentId}/report-card?term=${encodeURIComponent(t)}`;
        return (
          <Link
            key={t}
            href={href}
            className={
              active
                ? 'px-2.5 py-1 rounded-full text-[11.5px] font-semibold border bg-ink text-paper border-ink'
                : 'px-2.5 py-1 rounded-full text-[11.5px] font-semibold border bg-surface-2 text-ink-soft border-line hover:border-ink-faint hover:text-ink transition-colors'
            }
          >
            {t}
          </Link>
        );
      })}
    </div>
  );
}
