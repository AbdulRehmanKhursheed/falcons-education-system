import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { PrintTriggerButton } from '@/components/data/PrintTriggerButton';
import { formatDate, formatPKR, formatPercent, formatNumber } from '@/lib/format';
import { getStudentDetail } from '@/lib/queries/student-detail';
import { requireRole } from '@/lib/auth-helpers';
import { schoolProfile, formatSchoolAddress } from '@/lib/school-config';
import { db } from '@/lib/db';

export const metadata = { title: 'Student profile · Print' };

const programLabel: Record<string, string> = {
  NURSERY: 'Nursery',
  MONTESSORI: 'Montessori',
  KINDERGARTEN: 'Kindergarten',
  PRIMARY: 'Primary',
  EVENING_COACHING: 'Evening coaching',
  SATURDAY_COACHING: 'Saturday coaching',
  COMPUTER_COURSE: 'Computer course',
};

const statusLabel: Record<string, string> = {
  ACTIVE: 'Active',
  ON_LEAVE: 'On leave',
  INACTIVE: 'Inactive',
  GRADUATED: 'Graduated',
};

const invoiceStatusLabel: Record<string, string> = {
  PAID: 'Paid',
  PARTIALLY_PAID: 'Part-paid',
  ISSUED: 'Issued',
  OVERDUE: 'Overdue',
  DRAFT: 'Draft',
  CANCELLED: 'Cancelled',
};

export default async function StudentPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']);
  const { id } = await params;
  const student = await getStudentDetail(id);
  if (!student) notFound();

  // Teacher gate — match the detail page's rule so this print route can't be
  // used to peek at students from other classrooms.
  if (session.user.role === 'TEACHER') {
    const teacher = await db.teacher.findUnique({
      where: { userId: session.user.id },
      select: { homerooms: { select: { id: true } } },
    });
    const allowed = new Set(teacher?.homerooms.map((c) => c.id) ?? []);
    if (!student.enrollment || !allowed.has(student.enrollment.classroomId)) {
      notFound();
    }
  }

  const primaryGuardian = student.guardians.find((g) => g.isPrimary) ?? student.guardians[0];

  return (
    <>
      {/* Print-only CSS — hides portal chrome and lays the page out for A4. */}
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
          href={`/students/${student.id}`}
          className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
          Back to student
        </Link>
        <PrintTriggerButton />
      </div>

      <div className="print-sheet bg-paper border border-line rounded-lg p-8 sm:p-10 max-w-3xl mx-auto">
        {/* Header — school identity */}
        <header className="flex items-start justify-between gap-6 pb-5 border-b border-line-strong">
          <div className="flex items-start gap-3 min-w-0">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-ink text-paper shrink-0 print:bg-black print:text-white">
              <GraduationCap className="w-6 h-6" strokeWidth={1.5} />
            </span>
            <div className="min-w-0">
              <h1
                className="font-display text-2xl text-ink leading-tight print:text-[20pt]"
                style={{ fontVariationSettings: '"opsz" 48' }}
              >
                {schoolProfile.name}
              </h1>
              <p className="text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint mt-1">
                {schoolProfile.tagline}
              </p>
              <p className="text-[12px] text-ink-muted mt-2">
                {formatSchoolAddress()} · {schoolProfile.phone}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="eyebrow text-ink-faint">Student profile</p>
            <p
              className="mt-1 font-display text-xl text-ink leading-tight print:text-[18pt]"
              style={{ fontVariationSettings: '"opsz" 24' }}
            >
              {student.fullName}
            </p>
            <p className="text-[12px] text-ink-muted mt-1 tabular">
              Roll {student.rollNo}
            </p>
          </div>
        </header>

        {/* Profile + enrollment */}
        <section className="grid grid-cols-2 gap-6 py-5 border-b border-line-soft text-[12.5px]">
          <div>
            <p className="eyebrow text-ink-faint mb-2">Personal</p>
            <dl className="space-y-1">
              <MetaRow label="Full name" value={student.fullName} />
              <MetaRow label="Roll no" value={student.rollNo} mono />
              <MetaRow label="Date of birth" value={`${formatDate(student.dateOfBirth)} (${student.age} yrs)`} />
              <MetaRow label="Gender" value={student.gender ? capitalize(student.gender) : '—'} />
              <MetaRow label="Blood group" value={student.bloodGroup ?? '—'} />
              <MetaRow label="Status" value={statusLabel[student.status] ?? student.status} />
              <MetaRow
                label="Admission"
                value={student.admissionDate ? formatDate(student.admissionDate) : '—'}
              />
            </dl>
          </div>
          <div>
            <p className="eyebrow text-ink-faint mb-2">Enrollment</p>
            {student.enrollment ? (
              <dl className="space-y-1">
                <MetaRow label="Classroom" value={student.enrollment.classroomName} />
                <MetaRow
                  label="Program"
                  value={programLabel[student.enrollment.programKind] ?? student.enrollment.programKind}
                />
                <MetaRow
                  label="Homeroom"
                  value={student.enrollment.homeroomTeacherName ?? 'Unassigned'}
                />
                <MetaRow label="Enrolled" value={formatDate(student.enrollment.enrolledAt)} />
              </dl>
            ) : (
              <p className="text-[12.5px] italic text-ink-faint">No active enrollment.</p>
            )}

            <p className="eyebrow text-ink-faint mt-4 mb-2">Attendance · 30 days</p>
            <dl className="space-y-1">
              <MetaRow label="Attended" value={formatPercent(student.attendance.attendancePct, 0)} />
              <MetaRow
                label="Present / Late"
                value={`${student.attendance.totals.present} / ${student.attendance.totals.late}`}
              />
              <MetaRow
                label="Absent / Sick"
                value={`${student.attendance.totals.absent} / ${student.attendance.totals.sick}`}
              />
              <MetaRow label="Excused" value={String(student.attendance.totals.excused)} />
            </dl>
          </div>
        </section>

        {/* Guardians */}
        <section className="py-5 border-b border-line-soft">
          <p className="eyebrow text-ink-faint mb-2">Guardians</p>
          {student.guardians.length === 0 ? (
            <p className="text-[12.5px] italic text-ink-faint">No guardians on file.</p>
          ) : (
            <table className="w-full text-[12px] border border-line-soft">
              <thead className="bg-surface-2">
                <tr className="text-left">
                  <th className="px-3 py-2 eyebrow text-ink-faint font-semibold">Name</th>
                  <th className="px-3 py-2 eyebrow text-ink-faint font-semibold">Relation</th>
                  <th className="px-3 py-2 eyebrow text-ink-faint font-semibold">Phone</th>
                  <th className="px-3 py-2 eyebrow text-ink-faint font-semibold">CNIC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {student.guardians.map((g) => (
                  <tr key={g.guardianId}>
                    <td className="px-3 py-2 text-ink">
                      {g.fullName}
                      {g.isPrimary && (
                        <span className="ml-1.5 text-[10px] uppercase tracking-[0.12em] font-semibold text-accent">
                          Primary
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-ink-soft">{g.relation}</td>
                    <td className="px-3 py-2 font-mono tabular text-ink">{g.phone}</td>
                    <td className="px-3 py-2 font-mono tabular text-ink-soft">{g.cnic ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Fees */}
        <section className="py-5 border-b border-line-soft">
          <div className="flex items-baseline justify-between mb-2">
            <p className="eyebrow text-ink-faint">Fee status</p>
            <p className="text-[12.5px] tabular">
              Outstanding:{' '}
              <span className={student.outstandingDues > 0 ? 'font-semibold text-danger' : 'text-ink-soft'}>
                {student.outstandingDues > 0 ? formatPKR(student.outstandingDues) : '—'}
              </span>
            </p>
          </div>
          {student.invoices.length === 0 ? (
            <p className="text-[12.5px] italic text-ink-faint">No invoices issued yet.</p>
          ) : (
            <table className="w-full text-[12px] border border-line-soft">
              <thead className="bg-surface-2">
                <tr className="text-left">
                  <th className="px-3 py-2 eyebrow text-ink-faint font-semibold">Invoice</th>
                  <th className="px-3 py-2 eyebrow text-ink-faint font-semibold">Month</th>
                  <th className="px-3 py-2 eyebrow text-ink-faint font-semibold text-right">Total</th>
                  <th className="px-3 py-2 eyebrow text-ink-faint font-semibold text-right">Paid</th>
                  <th className="px-3 py-2 eyebrow text-ink-faint font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {student.invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-3 py-2 font-mono tabular text-ink">{inv.invoiceNo}</td>
                    <td className="px-3 py-2 text-ink-soft tabular">{inv.monthYear}</td>
                    <td className="px-3 py-2 text-right tabular text-ink">
                      {formatPKR(inv.total)}
                    </td>
                    <td className="px-3 py-2 text-right tabular text-ink-soft">
                      {formatPKR(inv.amountPaid)}
                    </td>
                    <td className="px-3 py-2 text-ink-soft">
                      {invoiceStatusLabel[inv.status] ?? inv.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Recent assessments */}
        <section className="py-5 border-b border-line-soft">
          <p className="eyebrow text-ink-faint mb-2">Recent assessments</p>
          {student.assessments.length === 0 ? (
            <p className="text-[12.5px] italic text-ink-faint">No assessments recorded.</p>
          ) : (
            <table className="w-full text-[12px] border border-line-soft">
              <thead className="bg-surface-2">
                <tr className="text-left">
                  <th className="px-3 py-2 eyebrow text-ink-faint font-semibold">Date</th>
                  <th className="px-3 py-2 eyebrow text-ink-faint font-semibold">Kind</th>
                  <th className="px-3 py-2 eyebrow text-ink-faint font-semibold">Detail</th>
                  <th className="px-3 py-2 eyebrow text-ink-faint font-semibold text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {student.assessments.map((a) => (
                  <tr key={a.id}>
                    <td className="px-3 py-2 tabular text-ink-soft whitespace-nowrap">
                      {formatDate(a.assessedAt)}
                    </td>
                    <td className="px-3 py-2 text-ink-soft whitespace-nowrap">
                      {assessmentKindLabel(a.kind)}
                    </td>
                    <td className="px-3 py-2 text-ink">
                      {a.kind === 'PRIMARY_GRADE'
                        ? `${a.subject ?? 'Subject'}${a.term ? ` · ${a.term}` : ''}`
                        : a.area || a.milestone || a.term || '—'}
                    </td>
                    <td className="px-3 py-2 text-right tabular text-ink">
                      {a.kind === 'PRIMARY_GRADE' && a.score !== null && a.scoreMax !== null
                        ? `${formatNumber(a.score)}/${formatNumber(a.scoreMax)}${a.grade ? ` · ${a.grade}` : ''}`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Notes */}
        {student.notes?.trim() && (
          <section className="py-5 border-b border-line-soft">
            <p className="eyebrow text-ink-faint mb-2">Notes</p>
            <p className="text-[12.5px] text-ink whitespace-pre-wrap leading-relaxed">
              {student.notes}
            </p>
          </section>
        )}

        {/* Signature row + meta */}
        <section className="pt-8">
          <div className="grid grid-cols-2 gap-10 text-[11.5px]">
            <div>
              <div className="h-px bg-ink-faint mb-2" />
              <p className="eyebrow text-ink-faint">Class teacher signature</p>
            </div>
            <div>
              <div className="h-px bg-ink-faint mb-2" />
              <p className="eyebrow text-ink-faint">Office stamp · date</p>
            </div>
          </div>

          <footer className="mt-8 pt-3 border-t border-line-soft flex items-center justify-between text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
            <span>
              {schoolProfile.name} · {schoolProfile.email}
            </span>
            <span className="tabular">
              {primaryGuardian
                ? `Primary contact: ${primaryGuardian.phone}`
                : 'No primary contact'}
              {' · '}Printed {formatDate(new Date().toISOString())}
            </span>
          </footer>
        </section>
      </div>
    </>
  );
}

function MetaRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="w-28 shrink-0 text-ink-faint">{label}</dt>
      <dd className={mono ? 'font-mono tabular text-[12px] text-ink' : 'text-ink'}>
        {value}
      </dd>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function assessmentKindLabel(k: string): string {
  return (
    {
      MONTESSORI_OBSERVATION: 'Observation',
      PRIMARY_GRADE: 'Grade',
      PROGRESS_NOTE: 'Progress note',
    }[k] ?? k
  );
}
