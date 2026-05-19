import { Megaphone } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { formatDate } from '@/lib/format';
import { requireRole } from '@/lib/auth-helpers';
import { getParentAnnouncements } from '@/lib/queries/parent';

export const metadata = { title: 'Announcements' };

const audienceTone: Record<string, Parameters<typeof Chip>[0]['tone']> = {
  ALL: 'brand',
  PARENTS_ONLY: 'accent',
  CLASSROOM: 'info',
  STAFF_ONLY: 'neutral',
  CUSTOM: 'neutral',
};

const audienceLabel: Record<string, string> = {
  ALL: 'Everyone',
  PARENTS_ONLY: 'For parents',
  CLASSROOM: 'Classroom',
  STAFF_ONLY: 'Staff',
  CUSTOM: 'Update',
};

export default async function ParentAnnouncementsPage() {
  const session = await requireRole(['PARENT']);
  const announcements = await getParentAnnouncements(session.user.id);

  const pinned = announcements.filter((a) => a.pinned);
  const rest = announcements.filter((a) => !a.pinned);

  return (
    <>
      <PageHeader
        eyebrow="News"
        title="School announcements"
        description="Updates from the school office and your child's classroom. New posts are listed first."
      />

      {announcements.length === 0 ? (
        <Card>
          <div className="px-5 py-16 text-center">
            <Megaphone className="w-5 h-5 text-accent mx-auto mb-2" strokeWidth={1.5} />
            <p
              className="font-display text-xl text-ink"
              style={{ fontVariationSettings: '"opsz" 24' }}
            >
              All quiet for now.
            </p>
            <p className="mt-1 text-[13px] text-ink-muted">
              When the school posts something new for you, you&rsquo;ll find it
              here.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {pinned.length > 0 && (
            <section className="mb-6">
              <p className="eyebrow text-accent mb-3">Pinned</p>
              <ul className="space-y-3">
                {pinned.map((a) => (
                  <AnnouncementCard key={a.id} announcement={a} />
                ))}
              </ul>
            </section>
          )}
          {rest.length > 0 && (
            <section>
              {pinned.length > 0 && (
                <p className="eyebrow text-ink-faint mb-3">Recent</p>
              )}
              <ul className="space-y-3">
                {rest.map((a) => (
                  <AnnouncementCard key={a.id} announcement={a} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </>
  );
}

function AnnouncementCard({
  announcement,
}: {
  announcement: {
    id: string;
    title: string;
    body: string;
    audience: string;
    classroomName: string | null;
    pinned: boolean;
    publishAt: string;
    postedByName: string | null;
  };
}) {
  return (
    <li>
      <Card>
        <div className="px-5 py-5">
          <div className="flex items-baseline gap-2 flex-wrap mb-2">
            {announcement.pinned && <Chip tone="accent">Pinned</Chip>}
            <Chip tone={audienceTone[announcement.audience] ?? 'neutral'}>
              {announcement.classroomName
                ? `Classroom · ${announcement.classroomName}`
                : audienceLabel[announcement.audience] ?? announcement.audience}
            </Chip>
            <span className="text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint ml-auto">
              {formatDate(announcement.publishAt, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <h3
            className="font-display text-xl text-ink leading-snug"
            style={{ fontVariationSettings: '"opsz" 24' }}
          >
            {announcement.title}
          </h3>
          <p className="text-[13.5px] text-ink-soft leading-relaxed mt-2 whitespace-pre-wrap">
            {announcement.body}
          </p>
          {announcement.postedByName && (
            <p className="text-[11px] text-ink-faint mt-3">
              Posted by {announcement.postedByName}
            </p>
          )}
        </div>
      </Card>
    </li>
  );
}
