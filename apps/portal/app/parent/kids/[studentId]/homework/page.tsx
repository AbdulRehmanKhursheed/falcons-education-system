import { notFound } from 'next/navigation';
import { Paperclip, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { formatDate } from '@/lib/format';
import { requireRole } from '@/lib/auth-helpers';
import {
  assertOwnsStudent,
  getChildHomework,
  getChildHeader,
} from '@/lib/queries/parent';
import { ChildHeader } from '../_components/ChildHeader';

export const metadata = { title: 'Homework' };

export default async function ChildHomeworkPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const session = await requireRole(['PARENT']);
  const { studentId } = await params;
  await assertOwnsStudent(session.user.id, studentId);

  const [child, homework] = await Promise.all([
    getChildHeader(studentId),
    getChildHomework(studentId),
  ]);
  if (!child) notFound();

  const now = new Date();
  const upcoming = homework.filter((h) => new Date(h.dueDate) >= now);
  const past = homework.filter((h) => new Date(h.dueDate) < now);

  return (
    <>
      <ChildHeader child={child} activeTab="homework" />

      {homework.length === 0 ? (
        <Card>
          <div className="px-5 py-16 text-center">
            <BookOpen className="w-5 h-5 text-accent mx-auto mb-2" strokeWidth={1.5} />
            <p
              className="font-display text-xl text-ink"
              style={{ fontVariationSettings: '"opsz" 24' }}
            >
              No homework this week — well done.
            </p>
            <p className="mt-1 text-[13px] text-ink-muted">
              We&rsquo;ll post anything new the moment the classroom teacher
              shares it.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="mb-6">
              <p className="eyebrow text-accent mb-3">Coming up</p>
              <ul className="space-y-3">
                {upcoming.map((h) => (
                  <HomeworkItem key={h.id} hw={h} state="upcoming" />
                ))}
              </ul>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <p className="eyebrow text-ink-faint mb-3">Earlier homework</p>
              <ul className="space-y-3">
                {past.map((h) => (
                  <HomeworkItem key={h.id} hw={h} state="past" />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </>
  );
}

function HomeworkItem({
  hw,
  state,
}: {
  hw: {
    id: string;
    subject: string;
    title: string;
    description: string | null;
    dueDate: string;
    postedAt: string;
    attachmentUrl: string | null;
    postedByName: string | null;
  };
  state: 'upcoming' | 'past';
}) {
  const isOverdue =
    state === 'upcoming' && false; // upcoming list only contains future dueDates
  void isOverdue;
  return (
    <li>
      <Card>
        <div className="px-5 py-4">
          <div className="flex items-baseline gap-2 flex-wrap mb-2">
            <Chip tone="brand">{hw.subject}</Chip>
            <span className="text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
              Due {formatDate(hw.dueDate, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            {state === 'past' && (
              <Chip tone="neutral" className="ml-auto">
                Past
              </Chip>
            )}
          </div>
          <p
            className="font-display text-lg text-ink leading-snug"
            style={{ fontVariationSettings: '"opsz" 24' }}
          >
            {hw.title}
          </p>
          {hw.description && (
            <p className="text-[13px] text-ink-muted leading-relaxed mt-2 whitespace-pre-wrap">
              {hw.description}
            </p>
          )}
          <footer className="mt-3 pt-3 border-t border-line-soft flex items-center justify-between gap-3 text-[11.5px] text-ink-faint">
            <span className="truncate">
              Posted by {hw.postedByName ?? 'Teacher'} ·{' '}
              {formatDate(hw.postedAt, { month: 'short', day: 'numeric' })}
            </span>
            {hw.attachmentUrl && (
              <a
                href={hw.attachmentUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-ink-soft hover:text-ink underline decoration-line decoration-1 underline-offset-[5px]"
              >
                <Paperclip className="w-3 h-3" strokeWidth={1.75} />
                Attachment
              </a>
            )}
          </footer>
        </div>
      </Card>
    </li>
  );
}
