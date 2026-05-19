import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ChevronLeft,
  CalendarDays,
  ExternalLink,
  Paperclip,
  Pencil,
  ClipboardList,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate, relativeTime } from '@/lib/format';
import { requireRole } from '@/lib/auth-helpers';
import {
  getClassroomsForFilter,
  getHomeworkDetail,
  getSubjectsForFilter,
  getTeacherHomeroomIds,
} from '@/lib/queries/homework';
import { HomeworkForm } from '@/components/data/HomeworkForm';
import { subjectTone } from '@/components/data/HomeworkList';
import { HomeworkDeleteButton } from './delete-button';

export const metadata = { title: 'Homework detail' };

type ChipTone = Parameters<typeof Chip>[0]['tone'];

const programLabel: Record<string, string> = {
  NURSERY: 'Nursery',
  MONTESSORI: 'Montessori',
  KINDERGARTEN: 'Kindergarten',
  PRIMARY: 'Primary',
  EVENING_COACHING: 'Evening coaching',
  SATURDAY_COACHING: 'Saturday coaching',
  COMPUTER_COURSE: 'Computer course',
};

function dueLabel(iso: string): { tone: ChipTone; label: string } {
  const due = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (dueDay.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (diffDays < 0) return { tone: 'danger', label: `Overdue · ${formatDate(iso)}` };
  if (diffDays === 0) return { tone: 'warn', label: `Due today · ${formatDate(iso)}` };
  if (diffDays === 1) return { tone: 'warn', label: `Due tomorrow · ${formatDate(iso)}` };
  if (diffDays <= 7) return { tone: 'info', label: `Due in ${diffDays} days · ${formatDate(iso)}` };
  return { tone: 'neutral', label: `Due ${formatDate(iso)}` };
}

export default async function HomeworkDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']);
  const { id } = await params;
  const { edit } = (await searchParams) ?? {};

  const detail = await getHomeworkDetail(id);
  if (!detail) notFound();

  // Teacher access: must own the classroom this homework belongs to, OR have
  // posted it themselves.
  let teacherHomerooms: string[] = [];
  if (session.user.role === 'TEACHER') {
    teacherHomerooms = await getTeacherHomeroomIds(session.user.id);
    const owns =
      teacherHomerooms.includes(detail.classroomId) ||
      detail.postedById === session.user.id;
    if (!owns) notFound();
  }

  const canEdit =
    session.user.role === 'SUPER_ADMIN' ||
    session.user.role === 'SCHOOL_ADMIN' ||
    (session.user.role === 'TEACHER' &&
      detail.postedById === session.user.id);

  const canDelete = canEdit;

  const due = dueLabel(detail.dueDate);
  const subjectChipTone: ChipTone = subjectTone[detail.subject] ?? 'neutral';

  const isEditing = edit === '1' && canEdit;

  // Source data for edit-mode form.
  let subjects: Awaited<ReturnType<typeof getSubjectsForFilter>> = [];
  let classrooms: Awaited<ReturnType<typeof getClassroomsForFilter>> = [];
  if (isEditing) {
    [subjects, classrooms] = await Promise.all([
      getSubjectsForFilter(),
      getClassroomsForFilter({
        restrictTo:
          session.user.role === 'TEACHER' ? teacherHomerooms : undefined,
      }),
    ]);
  }

  // Initial seed for the edit form — map the row's subject NAME back to its id.
  let initialSubjectId = '';
  if (isEditing) {
    const match = subjects.find((s) => s.name === detail.subject);
    initialSubjectId = match?.id ?? '';
  }

  return (
    <>
      <div className="mb-3">
        <Link
          href="/homework"
          className="inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint hover:text-ink transition-colors"
        >
          <ChevronLeft className="w-3 h-3" strokeWidth={2} />
          Homework board
        </Link>
      </div>

      <PageHeader
        eyebrow={`Homework · ${detail.classroomName}`}
        title={detail.title}
        description={
          <span className="flex flex-wrap items-center gap-2 mt-1">
            <Chip tone={subjectChipTone}>{detail.subject}</Chip>
            <Chip tone={due.tone}>
              <CalendarDays className="w-3 h-3 mr-1 inline" strokeWidth={2} />
              {due.label}
            </Chip>
          </span>
        }
        actions={
          isEditing ? (
            <Link
              href={`/homework/${detail.id}`}
              className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
            >
              Cancel edit
            </Link>
          ) : (
            <>
              {canEdit && (
                <Link
                  href={`/homework/${detail.id}?edit=1`}
                  className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
                  Edit
                </Link>
              )}
              {canDelete && <HomeworkDeleteButton id={detail.id} />}
            </>
          )
        }
      />

      {isEditing ? (
        <HomeworkForm
          mode="edit"
          homeworkId={detail.id}
          subjects={subjects}
          classrooms={classrooms}
          initial={{
            classroomId: detail.classroomId,
            subjectId: initialSubjectId,
            title: detail.title,
            description: detail.description,
            dueDate: detail.dueDate.slice(0, 10),
            attachmentUrl: detail.attachmentUrl,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader
              eyebrow="Assignment"
              title="What students need to do"
              action={<ClipboardList className="w-4 h-4 text-accent" strokeWidth={1.5} />}
            />
            <div className="px-5 py-5">
              {detail.description ? (
                <p className="text-[13.5px] text-ink whitespace-pre-wrap leading-[1.7]">
                  {detail.description}
                </p>
              ) : (
                <p className="text-[13px] italic text-ink-faint">
                  No description provided.
                </p>
              )}

              {detail.attachmentUrl && (
                <div className="mt-5 pt-5 border-t border-line-soft">
                  <p className="eyebrow text-ink-faint mb-2">Attachment</p>
                  <a
                    href={detail.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[13px] text-ink hover:text-brand-dark underline decoration-line decoration-1 underline-offset-[5px] break-all"
                  >
                    <Paperclip className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                    {detail.attachmentUrl}
                    <ExternalLink className="w-3 h-3 shrink-0" strokeWidth={2} />
                  </a>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader eyebrow="Metadata" title="Posting details" />
            <div className="px-5 py-5 space-y-4 text-[13px]">
              <div>
                <p className="eyebrow text-ink-faint">Classroom</p>
                <p className="font-display text-lg text-ink mt-0.5" style={{ fontVariationSettings: '"opsz" 24' }}>
                  {detail.classroomName}
                </p>
                <p className="text-[12px] text-ink-muted">
                  {programLabel[detail.classroomProgramKind] ?? detail.classroomProgramKind}
                </p>
              </div>
              <div>
                <p className="eyebrow text-ink-faint">Subject</p>
                <div className="mt-1">
                  <Chip tone={subjectChipTone}>{detail.subject}</Chip>
                </div>
              </div>
              <div>
                <p className="eyebrow text-ink-faint">Due</p>
                <p className="mt-0.5 tabular text-ink">{formatDate(detail.dueDate)}</p>
              </div>
              <div>
                <p className="eyebrow text-ink-faint">Posted by</p>
                <div className="mt-1 inline-flex items-center gap-2">
                  <Avatar name={detail.postedByName} size="sm" />
                  <div>
                    <p className="text-ink font-semibold">{detail.postedByName}</p>
                    <p className="text-[11.5px] text-ink-faint tabular">
                      {relativeTime(detail.postedAt)} · {formatDate(detail.postedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
