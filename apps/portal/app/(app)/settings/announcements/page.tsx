import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { requireRole } from '@/lib/auth-helpers';
import { getAnnouncements, getClassroomOptions } from '@/lib/queries/settings';
import { AnnouncementsManager } from './AnnouncementsManager';

export const metadata = { title: 'Announcements · Settings' };

export default async function AnnouncementsPage() {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);
  const [rows, classrooms] = await Promise.all([
    getAnnouncements(),
    getClassroomOptions(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Settings · 05 / Announcements"
        title="Announcements"
        description="Broadcast to staff, parents or a specific classroom. Pinned announcements stay at the top of the dashboard."
        actions={
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            All settings
          </Link>
        }
      />

      <AnnouncementsManager rows={rows} classrooms={classrooms} />
    </>
  );
}
