import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  GraduationCap,
  CalendarDays,
  BookOpen,
  Activity,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { TeacherEditForm } from '@/components/data/TeacherEditForm';
import { getTeacherDetail } from '@/lib/queries/teachers';
import { requireRole } from '@/lib/auth-helpers';
import { formatDate, relativeTime } from '@/lib/format';

export const metadata = { title: 'Teacher' };

const actionLabels: Record<string, string> = {
  'attendance.mark': 'Marked attendance',
  'attendance.bulk_update': 'Bulk-updated attendance',
  'assessment.create': 'Recorded assessment',
  'assessment.update': 'Updated assessment',
  'homework.create': 'Posted homework',
  'announcement.create': 'Posted announcement',
  'teacher.create': 'Created teacher',
  'teacher.update': 'Updated teacher',
  'student.create': 'Added student',
  'student.update': 'Updated student',
};

function readableAction(action: string): string {
  return (
    actionLabels[action] ??
    action.replace(/[_.]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);
  const { id } = await params;
  const teacher = await getTeacherDetail(id);
  if (!teacher) notFound();

  const canEdit =
    session.user.role === 'SUPER_ADMIN' || session.user.role === 'SCHOOL_ADMIN';

  return (
    <>
      <PageHeader
        eyebrow="Section · 04 / Teachers"
        title={teacher.name}
        description={
          teacher.qualification ?? 'Teacher profile, homerooms, and activity log.'
        }
        actions={
          <Link
            href="/teachers"
            className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Back to teachers
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile card */}
        <Card className="lg:col-span-1">
          <div className="p-6 flex flex-col items-center text-center border-b border-line-soft">
            <Avatar name={teacher.name} size="lg" className="!h-16 !w-16 !text-base" />
            <h2
              className="mt-4 font-display text-xl text-ink"
              style={{ fontVariationSettings: '"opsz" 24' }}
            >
              {teacher.name}
            </h2>
            <div className="mt-2 flex items-center gap-1.5">
              <Chip tone={teacher.isActive ? 'success' : 'neutral'}>
                {teacher.isActive ? 'Active' : 'Inactive'}
              </Chip>
              <Chip tone="brand">Teacher</Chip>
            </div>
          </div>

          <dl className="px-5 py-4 space-y-3 text-[12.5px]">
            <Row Icon={Mail} label="Email">
              <span className="font-mono text-[12px] tabular truncate block">
                {teacher.email}
              </span>
            </Row>
            <Row Icon={Phone} label="Phone">
              <span className="font-mono text-[12px] tabular">
                {teacher.phone ?? '—'}
              </span>
            </Row>
            <Row Icon={GraduationCap} label="Qualification">
              {teacher.qualification ?? '—'}
            </Row>
            <Row Icon={CalendarDays} label="Joined">
              {teacher.joinedAtIso
                ? formatDate(teacher.joinedAtIso, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : formatDate(teacher.createdAtIso, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
            </Row>
          </dl>
        </Card>

        {/* Right column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Homerooms */}
          <Card>
            <CardHeader
              eyebrow={`${teacher.homerooms.length} homeroom${
                teacher.homerooms.length === 1 ? '' : 's'
              }`}
              title="Classrooms"
              meta="Active homeroom assignments and current enrollment counts"
              action={
                <BookOpen className="w-4 h-4 text-accent" strokeWidth={1.5} />
              }
            />
            {teacher.homerooms.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-[13px] text-ink-faint italic">
                  No homeroom assigned yet.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-line-soft">
                {teacher.homerooms.map((h) => (
                  <li
                    key={h.id}
                    className="flex items-center justify-between px-5 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-surface-2 text-ink-soft"
                      >
                        <BookOpen className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </span>
                      <p className="font-semibold text-ink text-[13.5px]">
                        {h.name}
                      </p>
                    </div>
                    <span className="text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint tabular">
                      {h.studentCount} students
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Recent activity */}
          <Card>
            <CardHeader
              eyebrow="Last 10 events"
              title="Recent activity"
              meta="Audit log entries for this teacher"
              action={
                <Activity className="w-4 h-4 text-accent" strokeWidth={1.5} />
              }
            />
            {teacher.recentActivity.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-[13px] text-ink-faint italic">
                  No recorded activity yet.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-line-soft">
                {teacher.recentActivity.map((ev) => (
                  <li key={ev.id} className="px-5 py-3 flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-1 inline-block w-1 h-3 bg-accent shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-ink">
                        {readableAction(ev.action)}
                      </p>
                      <p className="text-[11.5px] text-ink-faint mt-0.5 font-mono tabular">
                        {ev.entityType} · {ev.entityId.slice(0, 10)}…
                      </p>
                    </div>
                    <span className="text-[11.5px] text-ink-faint tabular shrink-0">
                      {relativeTime(ev.createdAtIso)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Edit form */}
          {canEdit && (
            <Card>
              <CardHeader
                eyebrow="Admin"
                title="Edit teacher"
                meta="Update qualification and account status"
              />
              <div className="px-5 py-5">
                <TeacherEditForm
                  teacherId={teacher.id}
                  initialQualification={teacher.qualification}
                  initialActive={teacher.isActive}
                />
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function Row({
  Icon,
  label,
  children,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <Icon className="w-3.5 h-3.5 text-ink-faint shrink-0 mt-0.5" strokeWidth={1.75} />
      <div className="min-w-0 flex-1">
        <dt className="eyebrow text-ink-faint mb-0.5">{label}</dt>
        <dd className="text-ink-soft text-[13px] min-w-0">{children}</dd>
      </div>
    </div>
  );
}
