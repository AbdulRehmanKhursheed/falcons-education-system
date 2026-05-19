/**
 * Server-rendered A4-style report card layout.
 *
 * Reuses the print pattern from `/students/[id]/print/page.tsx` — same
 * `@media print` rules to hide the portal chrome, same school header card,
 * same signature row. Two render modes based on `isMontessori`:
 *
 *   • Primary  → scored subject table + total/percentage/grade summary
 *   • Montessori / early years → observations grouped by area
 *
 * Corner-marks match the `ComingSoon` print style for visual continuity.
 */

import { GraduationCap, ScrollText } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate, formatNumber, formatPercent } from '@/lib/format';
import { schoolProfile, formatSchoolAddress } from '@/lib/school-config';
import { subjectTone } from '@/components/data/HomeworkList';
import type { ReportCardData } from '@/lib/queries/report-card';

type ChipTone = Parameters<typeof Chip>[0]['tone'];

const gradeTone: Record<string, ChipTone> = {
  'A+': 'success',
  A: 'success',
  'B+': 'info',
  B: 'info',
  C: 'warn',
  F: 'danger',
};

const programLabel: Record<string, string> = {
  NURSERY: 'Nursery',
  MONTESSORI: 'Montessori',
  KINDERGARTEN: 'Kindergarten',
  PRIMARY: 'Primary',
  EVENING_COACHING: 'Evening coaching',
  SATURDAY_COACHING: 'Saturday coaching',
  COMPUTER_COURSE: 'Computer course',
};

export function ReportCardLayout({ data }: { data: ReportCardData }) {
  const { student, term, isMontessori, primary, observations, attendance, remarks } =
    data;

  return (
    <div className="relative">
      {/* Corner-marks — accent — match ComingSoon */}
      <span aria-hidden className="absolute -top-1 -left-1 h-4 w-4 border-t border-l border-accent print:hidden" />
      <span aria-hidden className="absolute -top-1 -right-1 h-4 w-4 border-t border-r border-accent print:hidden" />
      <span aria-hidden className="absolute -bottom-1 -left-1 h-4 w-4 border-b border-l border-accent print:hidden" />
      <span aria-hidden className="absolute -bottom-1 -right-1 h-4 w-4 border-b border-r border-accent print:hidden" />

      <div className="print-sheet bg-paper border border-line rounded-lg p-8 sm:p-10 max-w-3xl mx-auto">
        {/* ── Header — school identity ─────────────────────────────────── */}
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
            <p className="eyebrow text-accent">Report card · {term}</p>
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

        {/* ── Student card ─────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-5 border-b border-line-soft">
          <div className="sm:col-span-2 flex items-start gap-4">
            <Avatar name={student.fullName} size="lg" />
            <dl className="space-y-1 text-[12.5px]">
              <MetaRow label="Full name" value={student.fullName} />
              <MetaRow label="Roll no" value={student.rollNo} mono />
              <MetaRow
                label="Date of birth"
                value={`${formatDate(student.dateOfBirth)} (${student.age} yrs)`}
              />
              <MetaRow
                label="Classroom"
                value={
                  student.classroomName
                    ? `${student.classroomName} · ${student.programKind ? programLabel[student.programKind] ?? student.programKind : ''}`
                    : '—'
                }
              />
              <MetaRow
                label="Homeroom teacher"
                value={student.homeroomTeacherName ?? 'Unassigned'}
              />
            </dl>
          </div>

          <div>
            <p className="eyebrow text-ink-faint mb-2">Attendance · {attendance.windowLabel}</p>
            <dl className="space-y-1 text-[12.5px]">
              <MetaRow label="Attended" value={formatPercent(attendance.attendancePct, 0)} />
              <MetaRow
                label="Present / Late"
                value={`${attendance.present} / ${attendance.late}`}
              />
              <MetaRow
                label="Absent / Sick"
                value={`${attendance.absent} / ${attendance.sick}`}
              />
              <MetaRow label="Excused" value={String(attendance.excused)} />
            </dl>
          </div>
        </section>

        {/* ── Primary grade table OR Montessori observations ─────────── */}
        {isMontessori ? (
          <ObservationsSection groups={observations} />
        ) : (
          <PrimaryGradesSection primary={primary} />
        )}

        {/* ── Teacher remarks ──────────────────────────────────────────── */}
        <section className="py-5 border-b border-line-soft">
          <div className="flex items-center justify-between mb-2">
            <p className="eyebrow text-ink-faint">Teacher remarks</p>
            <ScrollText className="w-3.5 h-3.5 text-accent print:hidden" strokeWidth={1.5} />
          </div>
          {remarks.text ? (
            <>
              <p className="text-[12.5px] text-ink whitespace-pre-wrap leading-[1.65]">
                {remarks.text}
              </p>
              <p className="mt-2 text-[11px] text-ink-faint">
                {remarks.by ?? 'Teacher'} ·{' '}
                {remarks.at ? formatDate(remarks.at) : ''}
              </p>
            </>
          ) : (
            <p className="text-[12.5px] italic text-ink-faint">
              No teacher remarks recorded for this term.
            </p>
          )}
        </section>

        {/* ── Signature row + meta ─────────────────────────────────────── */}
        <section className="pt-8">
          <div className="grid grid-cols-3 gap-8 text-[11.5px]">
            <div>
              <div className="h-px bg-ink-faint mb-2" />
              <p className="eyebrow text-ink-faint">
                {student.homeroomTeacherName ?? 'Class teacher'} · Signature
              </p>
            </div>
            <div>
              <div className="h-px bg-ink-faint mb-2" />
              <p className="eyebrow text-ink-faint">
                {schoolProfile.principal} · Principal
              </p>
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
              Issued {formatDate(data.issuedAt)}
            </span>
          </footer>
        </section>
      </div>
    </div>
  );
}

function PrimaryGradesSection({
  primary,
}: {
  primary: ReportCardData['primary'];
}) {
  if (primary.rows.length === 0) {
    return (
      <section className="py-5 border-b border-line-soft">
        <p className="eyebrow text-ink-faint mb-2">Subject grades</p>
        <p className="text-[12.5px] italic text-ink-faint">
          No grades recorded for this term yet.
        </p>
      </section>
    );
  }

  return (
    <section className="py-5 border-b border-line-soft">
      <p className="eyebrow text-ink-faint mb-2">Subject grades</p>
      <table className="w-full text-[12px] border border-line-soft">
        <thead className="bg-surface-2">
          <tr className="text-left">
            <th className="px-3 py-2 eyebrow text-ink-faint font-semibold">Subject</th>
            <th className="px-3 py-2 eyebrow text-ink-faint font-semibold text-right">Score</th>
            <th className="px-3 py-2 eyebrow text-ink-faint font-semibold text-right">%</th>
            <th className="px-3 py-2 eyebrow text-ink-faint font-semibold">Grade</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft">
          {primary.rows.map((row) => {
            const tone: ChipTone = subjectTone[row.subjectName] ?? 'neutral';
            const gTone: ChipTone = gradeTone[row.grade] ?? 'neutral';
            return (
              <tr key={row.subjectName}>
                <td className="px-3 py-2">
                  <Chip tone={tone}>{row.subjectName}</Chip>
                </td>
                <td className="px-3 py-2 text-right tabular text-ink">
                  {formatNumber(row.score)}/{formatNumber(row.scoreMax)}
                </td>
                <td className="px-3 py-2 text-right tabular text-ink">
                  {formatPercent(row.percentage, 1)}
                </td>
                <td className="px-3 py-2">
                  <Chip tone={gTone}>{row.grade}</Chip>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-surface-2 border-t-2 border-line-strong">
          <tr>
            <td className="px-3 py-2 eyebrow text-ink-faint font-semibold">Total</td>
            <td className="px-3 py-2 text-right tabular font-semibold text-ink">
              {formatNumber(primary.totalScore)}/{formatNumber(primary.totalMax)}
            </td>
            <td className="px-3 py-2 text-right tabular font-semibold text-ink">
              {formatPercent(primary.percentage, 1)}
            </td>
            <td className="px-3 py-2">
              <Chip tone={gradeTone[primary.overallGrade] ?? 'neutral'}>
                {primary.overallGrade}
              </Chip>
            </td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
}

function ObservationsSection({
  groups,
}: {
  groups: ReportCardData['observations'];
}) {
  if (groups.length === 0) {
    return (
      <section className="py-5 border-b border-line-soft">
        <p className="eyebrow text-ink-faint mb-2">Observations</p>
        <p className="text-[12.5px] italic text-ink-faint">
          No observations recorded for this term yet.
        </p>
      </section>
    );
  }

  return (
    <section className="py-5 border-b border-line-soft space-y-5">
      <p className="eyebrow text-ink-faint">Areas of development</p>
      {groups.map((group) => (
        <div key={group.area} className="space-y-2">
          <div className="flex items-baseline gap-2">
            <Chip tone="accent">{group.area}</Chip>
            <span className="text-[11px] text-ink-faint tabular">
              {group.observations.length} milestone
              {group.observations.length === 1 ? '' : 's'}
            </span>
          </div>
          <ul className="space-y-1.5">
            {group.observations.map((o, idx) => (
              <li
                key={`${group.area}-${idx}`}
                className="flex items-start gap-3 text-[12.5px] text-ink"
              >
                <span
                  aria-hidden
                  className="mt-2 inline-block h-1 w-3 bg-accent shrink-0"
                />
                <div className="min-w-0">
                  <p className="leading-[1.6]">{o.milestone}</p>
                  {o.notes && (
                    <p className="text-[11.5px] text-ink-soft mt-0.5 leading-[1.55] whitespace-pre-wrap">
                      {o.notes}
                    </p>
                  )}
                  <p className="text-[10.5px] text-ink-faint tabular mt-0.5">
                    {o.assessedByName ?? 'Teacher'} · {formatDate(o.assessedAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
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
      <dt className="w-32 shrink-0 text-ink-faint">{label}</dt>
      <dd className={mono ? 'font-mono tabular text-[12px] text-ink' : 'text-ink'}>
        {value}
      </dd>
    </div>
  );
}
