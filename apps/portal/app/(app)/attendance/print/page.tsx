import Link from 'next/link';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { PrintTriggerButton } from '@/components/data/PrintTriggerButton';
import {
  getClassroomsForSelector,
  getRoster,
  parseISODate,
  todayMidnight,
  toISODate,
} from '@/lib/queries/attendance';
import { requireSession } from '@/lib/auth-helpers';
import { schoolProfile, formatSchoolAddress } from '@/lib/school-config';
import { db } from '@/lib/db';

export const metadata = { title: 'Attendance roster · Print' };

const statusLabel: Record<string, string> = {
  PRESENT: 'P',
  LATE: 'L',
  ABSENT: 'A',
  SICK: 'S',
  EXCUSED: 'E',
};

export default async function AttendancePrintPage({
  searchParams,
}: {
  searchParams: Promise<{ classroom?: string; date?: string }>;
}) {
  await requireSession();
  const sp = await searchParams;

  const classrooms = await getClassroomsForSelector();
  if (classrooms.length === 0) {
    return (
      <div className="p-10 text-center text-ink-muted">No classrooms available.</div>
    );
  }

  const classroomId = sp.classroom ?? classrooms[0].id;
  const classroom = classrooms.find((c) => c.id === classroomId) ?? classrooms[0];
  const date = sp.date ? parseISODate(sp.date) : todayMidnight();
  const dateIso = toISODate(date);

  const [roster, classroomFull] = await Promise.all([
    getRoster(classroom.id, date),
    db.classroom.findUnique({
      where: { id: classroom.id },
      select: {
        name: true,
        homeroomTeacher: { select: { user: { select: { name: true } } } },
        academicYear: { select: { name: true } },
      },
    }),
  ]);

  const totals = roster.reduce(
    (acc, r) => {
      if (r.currentStatus === 'PRESENT') acc.present++;
      else if (r.currentStatus === 'LATE') acc.late++;
      else if (r.currentStatus === 'ABSENT') acc.absent++;
      else if (r.currentStatus === 'SICK') acc.sick++;
      else if (r.currentStatus === 'EXCUSED') acc.excused++;
      else acc.unmarked++;
      return acc;
    },
    { present: 0, late: 0, absent: 0, sick: 0, excused: 0, unmarked: 0 },
  );

  const markableTotal = roster.length - totals.unmarked;
  const attendancePct =
    markableTotal > 0
      ? Math.round(((totals.present + totals.late) / markableTotal) * 1000) / 10
      : 0;

  const prettyDate = date.toLocaleDateString('en-PK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
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
            font-size: 11pt;
          }
          .print-sheet table { page-break-inside: auto; }
          .print-sheet tr { page-break-inside: avoid; page-break-after: auto; }
        }
      `}</style>

      <div className="no-print mb-6 flex items-center justify-between gap-4">
        <Link
          href={`/attendance?classroom=${encodeURIComponent(classroom.id)}&date=${dateIso}`}
          className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-ink-soft hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
          Back to attendance
        </Link>
        <PrintTriggerButton label="Print roster" />
      </div>

      <div className="print-sheet bg-surface border border-line rounded-lg p-8 max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-start justify-between gap-6 pb-5 border-b-2 border-ink">
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-ink text-paper shrink-0">
              <GraduationCap className="w-5 h-5" strokeWidth={1.5} />
            </span>
            <div>
              <p className="font-display text-2xl text-ink leading-tight" style={{ fontVariationSettings: '"opsz" 24' }}>
                {schoolProfile.name}
              </p>
              <p className="text-[11.5px] text-ink-muted mt-0.5">
                {formatSchoolAddress(schoolProfile)}
              </p>
              <p className="text-[11.5px] text-ink-muted">
                {schoolProfile.phone} · {schoolProfile.email}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="eyebrow text-ink-faint">Attendance roster</p>
            <p className="font-display text-lg text-ink mt-1">{classroomFull?.name ?? classroom.name}</p>
            <p className="text-[11.5px] text-ink-muted">{classroomFull?.academicYear?.name ?? ''}</p>
          </div>
        </header>

        {/* Date + meta */}
        <div className="grid grid-cols-3 gap-4 py-4 border-b border-line-soft text-[12px]">
          <div>
            <p className="eyebrow text-ink-faint mb-1">Date</p>
            <p className="font-semibold text-ink">{prettyDate}</p>
          </div>
          <div>
            <p className="eyebrow text-ink-faint mb-1">Homeroom teacher</p>
            <p className="font-semibold text-ink">
              {classroomFull?.homeroomTeacher?.user?.name ?? '—'}
            </p>
          </div>
          <div>
            <p className="eyebrow text-ink-faint mb-1">Attendance %</p>
            <p className="font-display text-lg text-ink tabular">
              {markableTotal > 0 ? `${attendancePct}%` : '—'}
            </p>
          </div>
        </div>

        {/* Totals strip */}
        <div className="flex flex-wrap gap-4 py-3 border-b border-line-soft text-[11.5px] text-ink-soft">
          <span><strong className="text-ink">{roster.length}</strong> enrolled</span>
          <span><strong className="text-ink">{totals.present}</strong> present</span>
          <span><strong className="text-ink">{totals.late}</strong> late</span>
          <span><strong className="text-ink">{totals.absent}</strong> absent</span>
          <span><strong className="text-ink">{totals.sick}</strong> sick</span>
          <span><strong className="text-ink">{totals.excused}</strong> excused</span>
          {totals.unmarked > 0 && (
            <span><strong className="text-danger">{totals.unmarked}</strong> unmarked</span>
          )}
        </div>

        {/* Roster table */}
        <table className="w-full mt-4 text-[12px]">
          <thead>
            <tr className="text-left border-b border-ink">
              <th className="py-2 pr-2 eyebrow text-ink-faint w-10">#</th>
              <th className="py-2 pr-2 eyebrow text-ink-faint">Roll no</th>
              <th className="py-2 pr-2 eyebrow text-ink-faint">Student</th>
              <th className="py-2 pr-2 eyebrow text-ink-faint w-16 text-center">Status</th>
              <th className="py-2 pr-2 eyebrow text-ink-faint">Remark</th>
              <th className="py-2 pr-2 eyebrow text-ink-faint w-24">Initials</th>
            </tr>
          </thead>
          <tbody>
            {roster.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-ink-muted italic">
                  No students enrolled in this classroom.
                </td>
              </tr>
            )}
            {roster.map((r, i) => (
              <tr key={r.studentId} className="border-b border-line-soft">
                <td className="py-2 pr-2 text-ink-muted tabular">{i + 1}</td>
                <td className="py-2 pr-2 font-mono text-[11px] text-ink-soft tabular">{r.rollNo}</td>
                <td className="py-2 pr-2 font-semibold text-ink">{r.name}</td>
                <td className="py-2 pr-2 text-center font-semibold tabular">
                  {r.currentStatus ? statusLabel[r.currentStatus] ?? '—' : '—'}
                </td>
                <td className="py-2 pr-2 text-ink-soft">{r.remark ?? ''}</td>
                <td className="py-2 pr-2 border-l border-line-soft"></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Legend + signature block */}
        <div className="mt-6 grid grid-cols-2 gap-8 text-[11px] text-ink-muted">
          <div>
            <p className="eyebrow text-ink-faint mb-2">Legend</p>
            <p>P = Present · L = Late · A = Absent · S = Sick · E = Excused</p>
          </div>
          <div className="text-right">
            <p className="eyebrow text-ink-faint mb-8">Teacher signature</p>
            <p className="border-t border-ink pt-1 inline-block min-w-[200px]">&nbsp;</p>
          </div>
        </div>
      </div>
    </>
  );
}
