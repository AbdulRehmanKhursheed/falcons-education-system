import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Pencil,
  CalendarDays,
  GraduationCap,
  Cake,
  Droplet,
  IdCard,
  Phone,
  ChevronLeft,
  BookOpen,
  ClipboardList,
  Activity,
  ArrowUpRight,
  ScrollText,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate, formatPKR, formatNumber } from '@/lib/format';
import { requireRole } from '@/lib/auth-helpers';
import {
  getStudentDetail,
  getStudentActivity,
} from '@/lib/queries/student-detail';
import { StudentDetailGuardians } from '@/components/data/StudentDetailGuardians';
import { StudentDetailAttendance } from '@/components/data/StudentDetailAttendance';
import { StudentDetailActivity } from '@/components/data/StudentDetailActivity';
import { StudentDetailNotes } from '@/components/data/StudentDetailNotes';
import { StudentDetailArchive } from '@/components/data/StudentDetailArchive';
import { db } from '@/lib/db';

export const metadata = { title: 'Student detail' };

const statusTone: Record<
  'ACTIVE' | 'ON_LEAVE' | 'INACTIVE' | 'GRADUATED',
  Parameters<typeof Chip>[0]['tone']
> = {
  ACTIVE: 'success',
  ON_LEAVE: 'warn',
  INACTIVE: 'danger',
  GRADUATED: 'info',
};

const statusLabel: Record<string, string> = {
  ACTIVE: 'Active',
  ON_LEAVE: 'On leave',
  INACTIVE: 'Inactive',
  GRADUATED: 'Graduated',
};

const invoiceStatusTone: Record<string, Parameters<typeof Chip>[0]['tone']> = {
  PAID: 'success',
  PARTIALLY_PAID: 'warn',
  ISSUED: 'info',
  OVERDUE: 'danger',
  DRAFT: 'neutral',
  CANCELLED: 'neutral',
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

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']);
  const { id } = await params;

  const [student, activity] = await Promise.all([
    getStudentDetail(id),
    getStudentActivity(id),
  ]);

  if (!student) notFound();

  // Teacher access check — only see students in classrooms they teach.
  if (session.user.role === 'TEACHER') {
    const teacher = await db.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true, homerooms: { select: { id: true } } },
    });
    const allowedClassroomIds = new Set(teacher?.homerooms.map((c) => c.id) ?? []);
    if (
      !student.enrollment ||
      !allowedClassroomIds.has(student.enrollment.classroomId)
    ) {
      // Falls back to /dashboard the same way requireRole does — but we
      // don't want to leak existence so render a 404.
      notFound();
    }
  }

  const canEdit =
    session.user.role === 'SUPER_ADMIN' || session.user.role === 'SCHOOL_ADMIN';

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
        eyebrow={`Students · ${student.rollNo}`}
        title={student.fullName}
        description={
          student.enrollment
            ? `Enrolled in ${student.enrollment.classroomName} · ${programLabel[student.enrollment.programKind] ?? student.enrollment.programKind}`
            : 'No current enrollment'
        }
        actions={
          <>
            {canEdit && (
              <Link
                href={`/students/${student.id}/edit`}
                className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
                Edit
              </Link>
            )}
            {canEdit && <StudentDetailArchive studentId={student.id} />}
          </>
        }
      />

      {/* Profile + key stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Profile */}
        <Card className="lg:col-span-2">
          <CardHeader
            eyebrow="Profile"
            title="Student details"
            action={<Chip tone={statusTone[student.status]}>{statusLabel[student.status]}</Chip>}
          />
          <div className="px-5 py-5">
            <div className="flex items-start gap-5 mb-5">
              <Avatar name={student.fullName} size="lg" />
              <div className="min-w-0">
                <p className="font-display text-2xl text-ink leading-tight" style={{ fontVariationSettings: '"opsz" 24' }}>
                  {student.fullName}
                </p>
                <p className="font-mono text-[12.5px] text-ink-muted tabular mt-1">
                  Roll {student.rollNo}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
              <Field label="Date of birth" Icon={Cake}>
                {formatDate(student.dateOfBirth)}{' '}
                <span className="text-ink-faint">· {student.age} yrs</span>
              </Field>
              <Field label="Gender" Icon={IdCard}>
                {student.gender ? capitalize(student.gender) : '—'}
              </Field>
              <Field label="Blood group" Icon={Droplet}>
                {student.bloodGroup ?? '—'}
              </Field>
              <Field label="Admission date" Icon={CalendarDays}>
                {student.admissionDate ? formatDate(student.admissionDate) : '—'}
              </Field>
            </dl>
          </div>
        </Card>

        {/* Enrollment */}
        <Card>
          <CardHeader
            eyebrow="Current enrollment"
            title="Classroom"
            action={<GraduationCap className="w-4 h-4 text-accent" strokeWidth={1.5} />}
          />
          {student.enrollment ? (
            <div className="px-5 py-5 space-y-3">
              <div>
                <p className="eyebrow text-ink-faint">Classroom</p>
                <p className="font-display text-xl text-ink mt-0.5" style={{ fontVariationSettings: '"opsz" 24' }}>
                  {student.enrollment.classroomName}
                </p>
                <p className="text-[12px] text-ink-muted">
                  {programLabel[student.enrollment.programKind] ?? student.enrollment.programKind}
                </p>
              </div>
              <div>
                <p className="eyebrow text-ink-faint">Homeroom teacher</p>
                <p className="text-[13px] text-ink mt-0.5">
                  {student.enrollment.homeroomTeacherName ?? (
                    <span className="text-ink-faint italic">Unassigned</span>
                  )}
                </p>
              </div>
              <div>
                <p className="eyebrow text-ink-faint">Enrolled</p>
                <p className="text-[13px] text-ink mt-0.5">
                  {formatDate(student.enrollment.enrolledAt)}
                </p>
              </div>
            </div>
          ) : (
            <div className="px-5 py-8 text-center text-[12.5px] text-ink-faint italic">
              No active enrollment
            </div>
          )}
        </Card>
      </div>

      {/* Guardians + Attendance row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader
            eyebrow="Family"
            title="Guardians"
            meta={`${student.guardians.length} linked`}
            action={<Phone className="w-4 h-4 text-accent" strokeWidth={1.5} />}
          />
          <StudentDetailGuardians guardians={student.guardians} />
        </Card>

        <Card>
          <CardHeader
            eyebrow="Attendance"
            title="Last 30 days"
            meta="Present + late counted as attended"
            action={<Activity className="w-4 h-4 text-accent" strokeWidth={1.5} />}
          />
          <StudentDetailAttendance summary={student.attendance} />
        </Card>
      </div>

      {/* Fees + Assessments row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader
            eyebrow="Fees"
            title="Recent invoices"
            meta={`Outstanding: ${student.outstandingDues > 0 ? formatPKR(student.outstandingDues) : '—'}`}
            action={
              <Link
                href="/fees"
                className="inline-flex items-center gap-1 text-[12px] text-ink-muted hover:text-ink underline decoration-line decoration-1 underline-offset-[5px]"
              >
                Full fees <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
              </Link>
            }
          />
          {student.invoices.length === 0 ? (
            <div className="px-5 py-6 text-[12.5px] text-ink-faint italic">
              No invoices yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead className="bg-surface-2 border-b border-line-soft">
                  <tr className="text-left">
                    <th className="px-5 py-2.5 eyebrow text-ink-faint">Month</th>
                    <th className="px-5 py-2.5 eyebrow text-ink-faint text-right">Total</th>
                    <th className="px-5 py-2.5 eyebrow text-ink-faint text-right">Paid</th>
                    <th className="px-5 py-2.5 eyebrow text-ink-faint">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {student.invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-surface-2 transition-colors">
                      <td className="px-5 py-2.5">
                        <p className="text-ink font-mono tabular">{inv.monthYear}</p>
                        <p className="text-[11px] text-ink-faint font-mono">{inv.invoiceNo}</p>
                      </td>
                      <td className="px-5 py-2.5 text-right tabular font-semibold text-ink">
                        {formatPKR(inv.total)}
                      </td>
                      <td className="px-5 py-2.5 text-right tabular text-ink-soft">
                        {formatPKR(inv.amountPaid)}
                      </td>
                      <td className="px-5 py-2.5">
                        <Chip tone={invoiceStatusTone[inv.status] ?? 'neutral'}>
                          {humanInvoiceStatus(inv.status)}
                        </Chip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            eyebrow="Academics"
            title="Recent assessments"
            meta="Latest 5 across observations + grades"
            action={<BookOpen className="w-4 h-4 text-accent" strokeWidth={1.5} />}
          />
          {student.assessments.length === 0 ? (
            <div className="px-5 py-6 text-[12.5px] text-ink-faint italic">
              No assessments yet.
            </div>
          ) : (
            <ul className="divide-y divide-line-soft">
              {student.assessments.map((a) => (
                <li key={a.id} className="px-5 py-3">
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold text-ink truncate">
                        {a.kind === 'PRIMARY_GRADE'
                          ? `${a.subject ?? 'Subject'} · ${a.term ?? ''}`.trim()
                          : a.area || a.term || 'Observation'}
                      </p>
                      <p className="text-[11px] text-ink-faint">
                        {a.assessedByName ?? 'Teacher'} · {formatDate(a.assessedAt)}
                      </p>
                    </div>
                    {a.kind === 'PRIMARY_GRADE' && a.score !== null && a.scoreMax !== null ? (
                      <span className="font-mono tabular font-semibold text-ink text-[13px] shrink-0">
                        {formatNumber(a.score)}/{formatNumber(a.scoreMax)}
                        {a.grade && (
                          <span className="ml-2 text-accent">{a.grade}</span>
                        )}
                      </span>
                    ) : (
                      <Chip tone="brand">{assessmentKindLabel(a.kind)}</Chip>
                    )}
                  </div>
                  {(a.milestone || a.notes) && (
                    <p className="text-[12px] text-ink-soft mt-1 line-clamp-2">
                      {a.milestone || a.notes}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Notes + Activity row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader
            eyebrow="Notes"
            title="Medical, allergies, reminders"
            action={<ScrollText className="w-4 h-4 text-accent" strokeWidth={1.5} />}
          />
          {canEdit ? (
            <StudentDetailNotes
              studentId={student.id}
              initial={{
                firstName: student.firstName,
                lastName: student.lastName,
                dateOfBirth: student.dateOfBirth,
                gender: student.gender,
                bloodGroup: student.bloodGroup,
                status: student.status,
                admissionDate: student.admissionDate,
                photoUrl: student.photoUrl,
                notes: student.notes,
              }}
            />
          ) : (
            <div className="px-5 py-4">
              <p className="text-[13px] text-ink-soft whitespace-pre-wrap">
                {student.notes?.trim() ? (
                  student.notes
                ) : (
                  <span className="italic text-ink-faint">No notes.</span>
                )}
              </p>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            eyebrow="Audit log"
            title="Activity"
            meta="Last 5 events"
            action={<ClipboardList className="w-4 h-4 text-accent" strokeWidth={1.5} />}
          />
          <StudentDetailActivity entries={activity} />
        </Card>
      </div>
    </>
  );
}

function Field({
  label,
  Icon,
  children,
}: {
  label: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="eyebrow text-ink-faint flex items-center gap-1.5">
        <Icon className="w-3 h-3" strokeWidth={1.75} />
        {label}
      </dt>
      <dd className="text-ink mt-0.5 truncate">{children}</dd>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function humanInvoiceStatus(s: string): string {
  return s
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
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
