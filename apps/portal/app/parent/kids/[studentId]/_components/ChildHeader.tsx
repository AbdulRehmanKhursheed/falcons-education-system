import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import type { ParentChildHeader } from '@/lib/queries/parent';

const programLabel: Record<string, string> = {
  NURSERY: 'Nursery',
  MONTESSORI: 'Montessori',
  KINDERGARTEN: 'Kindergarten',
  PRIMARY: 'Primary',
  EVENING_COACHING: 'Evening coaching',
  SATURDAY_COACHING: 'Saturday coaching',
  COMPUTER_COURSE: 'Computer course',
};

/**
 * Persistent header strip shown at the top of every per-child page.
 * Provides identity (avatar + name), context (classroom + roll), and a
 * "Back to overview" affordance.
 */
// Early-years programmes record observations, not letter grades — show
// "Progress" instead of "Grades" so the tab label matches what the parent
// will actually see on the page.
const EARLY_YEARS_KINDS = new Set(['NURSERY', 'MONTESSORI', 'KINDERGARTEN']);

export function ChildHeader({ child, activeTab }: { child: ParentChildHeader; activeTab?: TabId }) {
  const tabs = childTabs(child.id, child.programKind);

  return (
    <header className="mb-7">
      <div className="mb-3">
        <Link
          href="/parent/dashboard"
          className="inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint hover:text-ink transition-colors"
        >
          <ChevronLeft className="w-3 h-3" strokeWidth={2} />
          Dashboard
        </Link>
      </div>

      <div className="flex items-start gap-5">
        <Avatar name={child.fullName} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-accent">
            {child.classroomName ?? 'No classroom'}
            <span className="text-ink-faint"> · </span>
            <span className="font-mono normal-case tracking-[0.16em] text-ink-faint">
              {child.rollNo}
            </span>
          </p>
          <h1
            className="font-display text-[2.25rem] sm:text-[2.5rem] leading-[1.05] text-ink mt-2"
            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
          >
            {child.fullName}
          </h1>
          {child.programKind && (
            <p className="mt-2">
              <Chip tone="brand">
                {programLabel[child.programKind] ?? child.programKind}
              </Chip>
            </p>
          )}
        </div>
      </div>

      <nav className="mt-6 flex flex-wrap gap-1.5 border-b border-line-soft" aria-label="Child sections">
        {tabs.map((t) => {
          const active = activeTab === t.id;
          return (
            <Link
              key={t.id}
              href={t.href}
              className={
                'inline-flex items-center gap-1.5 px-3.5 py-2.5 text-[12.5px] font-semibold border-b-2 transition-colors ' +
                (active
                  ? 'border-ink text-ink'
                  : 'border-transparent text-ink-faint hover:text-ink')
              }
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

export type TabId = 'overview' | 'attendance' | 'fees' | 'grades' | 'homework' | 'timetable';

function childTabs(
  id: string,
  programKind: ParentChildHeader['programKind'],
): Array<{ id: TabId; label: string; href: string }> {
  const gradesLabel =
    programKind && EARLY_YEARS_KINDS.has(programKind) ? 'Progress' : 'Grades';
  return [
    { id: 'overview', label: 'Overview', href: `/parent/kids/${id}` },
    { id: 'attendance', label: 'Attendance', href: `/parent/kids/${id}/attendance` },
    { id: 'fees', label: 'Fees', href: `/parent/kids/${id}/fees` },
    { id: 'grades', label: gradesLabel, href: `/parent/kids/${id}/grades` },
    { id: 'homework', label: 'Homework', href: `/parent/kids/${id}/homework` },
    { id: 'timetable', label: 'Timetable', href: `/parent/kids/${id}/timetable` },
  ];
}
