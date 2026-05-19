'use client';

/**
 * Homework list — toolbar + responsive table / card display.
 *
 * The toolbar uses URL-state via `useUrlState` so admins can deep-link to a
 * classroom + subject view. Subject Chip tone follows a fixed mapping so
 * teachers learn to scan by colour.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  CalendarDays,
  Filter,
  Paperclip,
  Search,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import { useUrlState } from '@/hooks/useUrlState';
import type {
  ClassroomOption,
  HomeworkRow,
  SubjectOption,
} from '@/lib/queries/homework';

type ChipTone = Parameters<typeof Chip>[0]['tone'];

/**
 * Subject → Chip tone. Same colour family used everywhere homework
 * surfaces so teachers can scan by colour at a glance. Unknown subjects
 * fall through to neutral.
 */
export const subjectTone: Record<string, ChipTone> = {
  Math: 'brand',
  Urdu: 'accent',
  English: 'info',
  Science: 'success',
  'Social Studies': 'warn',
  Islamiat: 'neutral',
  Computer: 'brand',
};

function getSubjectTone(name: string): ChipTone {
  return subjectTone[name] ?? 'neutral';
}

type Props = {
  initialRows: HomeworkRow[];
  initialTotal: number;
  subjects: SubjectOption[];
  classrooms: ClassroomOption[];
  initialFilters: {
    query: string;
    classroomId: string; // 'All' or id
    subjectId: string; // 'All' or id
    activeOnly: boolean;
  };
  canPost: boolean;
};

export function HomeworkList({
  initialRows,
  initialTotal,
  subjects,
  classrooms,
  initialFilters,
  canPost: _canPost,
}: Props) {
  const router = useRouter();
  const { set } = useUrlState();

  const [query, setQuery] = useState(initialFilters.query);
  const [classroomId, setClassroomId] = useState(initialFilters.classroomId);
  const [subjectId, setSubjectId] = useState(initialFilters.subjectId);
  const [activeOnly, setActiveOnly] = useState(initialFilters.activeOnly);

  // The server already filtered to `initialRows` — when local query changes
  // we filter client-side for snappy typing. Filter switches go via URL so
  // the server re-runs the query.
  const visibleRows = useMemo(() => {
    if (!query.trim()) return initialRows;
    const q = query.trim().toLowerCase();
    return initialRows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q) ||
        (r.description?.toLowerCase().includes(q) ?? false) ||
        r.classroomName.toLowerCase().includes(q),
    );
  }, [query, initialRows]);

  function syncUrl(next: {
    classroomId?: string;
    subjectId?: string;
    activeOnly?: boolean;
  }) {
    const params: Record<string, string | null> = {};
    if ('classroomId' in next) {
      params.classroom =
        next.classroomId && next.classroomId !== 'All' ? next.classroomId : null;
    }
    if ('subjectId' in next) {
      params.subject =
        next.subjectId && next.subjectId !== 'All' ? next.subjectId : null;
    }
    if ('activeOnly' in next) {
      params.activeOnly = next.activeOnly ? null : 'false';
    }
    set(params);
    router.refresh();
  }

  return (
    <div className="bg-surface border border-line rounded-lg">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-line-soft">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint"
            strokeWidth={1.75}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, subject, classroom…"
            className="w-full pl-9 pr-4 py-2 rounded-md border border-line bg-surface-2 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink focus:bg-surface transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 text-[11.5px] font-semibold text-ink-faint">
          <Filter className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span className="uppercase tracking-[0.14em]">Classroom</span>
        </div>
        <div className="flex flex-wrap gap-1">
          <FilterPill
            active={classroomId === 'All'}
            label="All"
            onClick={() => {
              setClassroomId('All');
              syncUrl({ classroomId: 'All' });
            }}
          />
          {classrooms.map((c) => {
            const active = classroomId === c.id;
            return (
              <FilterPill
                key={c.id}
                active={active}
                label={c.name}
                onClick={() => {
                  setClassroomId(c.id);
                  syncUrl({ classroomId: c.id });
                }}
              />
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            const next = !activeOnly;
            setActiveOnly(next);
            syncUrl({ activeOnly: next });
          }}
          aria-pressed={activeOnly}
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition-colors',
            activeOnly
              ? 'bg-ink text-paper border-ink'
              : 'bg-surface-2 text-ink-soft border-line hover:text-ink',
          )}
        >
          {activeOnly ? (
            <ToggleRight className="w-3.5 h-3.5" strokeWidth={2} />
          ) : (
            <ToggleLeft className="w-3.5 h-3.5" strokeWidth={2} />
          )}
          Active only
        </button>

        <p className="ml-auto text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint tabular">
          {visibleRows.length} of {initialTotal}
        </p>
      </div>

      {/* Subject chip filter row */}
      <div className="flex flex-wrap items-center gap-1.5 px-5 py-3 border-b border-line-soft bg-surface-2/40">
        <span className="eyebrow text-ink-faint mr-2">Subject</span>
        <SubjectChipFilter
          label="All"
          tone="neutral"
          active={subjectId === 'All'}
          onClick={() => {
            setSubjectId('All');
            syncUrl({ subjectId: 'All' });
          }}
        />
        {subjects.map((s) => (
          <SubjectChipFilter
            key={s.id}
            label={s.name}
            tone={getSubjectTone(s.name)}
            active={subjectId === s.id}
            onClick={() => {
              setSubjectId(s.id);
              syncUrl({ subjectId: s.id });
            }}
          />
        ))}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-line-soft">
        {visibleRows.length === 0 ? (
          <EmptyState />
        ) : (
          visibleRows.map((h) => (
            <Link
              key={h.id}
              href={`/homework/${h.id}`}
              className="block px-4 py-3.5 hover:bg-surface-2 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <Chip tone={getSubjectTone(h.subject)}>{h.subject}</Chip>
                <DueChip dueIso={h.dueDate} />
              </div>
              <p className="font-semibold text-ink text-[14px] leading-tight">
                {h.title}
              </p>
              <p className="mt-1 text-[12px] text-ink-muted truncate">
                {h.classroomName} · Posted by {h.postedByName}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11.5px] text-ink-faint">
                <span className="font-mono tabular">
                  {formatDate(h.postedAt)}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="bg-surface-2 border-b border-line-soft">
            <tr className="text-left">
              <th className="px-5 py-3 eyebrow text-ink-faint font-semibold">Subject</th>
              <th className="px-5 py-3 eyebrow text-ink-faint font-semibold">Title</th>
              <th className="px-5 py-3 eyebrow text-ink-faint font-semibold">Classroom</th>
              <th className="px-5 py-3 eyebrow text-ink-faint font-semibold whitespace-nowrap">
                Due
              </th>
              <th className="px-5 py-3 eyebrow text-ink-faint font-semibold">Posted by</th>
              <th className="px-5 py-3 eyebrow text-ink-faint font-semibold whitespace-nowrap">
                Posted
              </th>
              <th className="px-5 py-3 text-right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {visibleRows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-16">
                  <EmptyState />
                </td>
              </tr>
            )}
            {visibleRows.map((h) => (
              <tr
                key={h.id}
                className="group hover:bg-surface-2 transition-colors"
              >
                <td className="px-5 py-3">
                  <Chip tone={getSubjectTone(h.subject)}>{h.subject}</Chip>
                </td>
                <td className="px-5 py-3">
                  <Link
                    href={`/homework/${h.id}`}
                    className="font-semibold text-ink hover:underline decoration-line decoration-1 underline-offset-[5px]"
                  >
                    {h.title}
                  </Link>
                  {h.attachmentUrl && (
                    <span className="ml-2 inline-flex items-center align-middle text-ink-faint">
                      <Paperclip className="w-3 h-3" strokeWidth={2} />
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-ink-soft">{h.classroomName}</td>
                <td className="px-5 py-3 whitespace-nowrap">
                  <DueChip dueIso={h.dueDate} />
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-2 text-ink-soft">
                    <Avatar name={h.postedByName} size="xs" />
                    <span className="truncate">{h.postedByName}</span>
                  </span>
                </td>
                <td className="px-5 py-3 tabular text-ink-faint whitespace-nowrap">
                  {formatDate(h.postedAt)}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/homework/${h.id}`}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-md text-ink-faint group-hover:text-ink group-hover:bg-surface-3 transition-all"
                    aria-label={`Open ${h.title}`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition-colors',
        active
          ? 'bg-ink text-paper border-ink'
          : 'bg-surface-2 text-ink-soft border-line hover:border-ink-faint hover:text-ink',
      )}
    >
      {label}
    </button>
  );
}

function SubjectChipFilter({
  label,
  tone,
  active,
  onClick,
}: {
  label: string;
  tone: ChipTone;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'transition-all rounded-full',
        active
          ? 'ring-1 ring-ink ring-offset-1 ring-offset-surface'
          : 'opacity-70 hover:opacity-100',
      )}
    >
      <Chip tone={tone}>{label}</Chip>
    </button>
  );
}

function DueChip({ dueIso }: { dueIso: string }) {
  const due = new Date(dueIso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (dueDay.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
  );

  let tone: ChipTone = 'info';
  let label = '';
  if (diffDays < 0) {
    tone = 'danger';
    label = `Overdue · ${formatDate(dueIso, { month: 'short', day: 'numeric' })}`;
  } else if (diffDays === 0) {
    tone = 'warn';
    label = 'Due today';
  } else if (diffDays === 1) {
    tone = 'warn';
    label = 'Due tomorrow';
  } else if (diffDays <= 7) {
    tone = 'info';
    label = `In ${diffDays} days`;
  } else {
    tone = 'neutral';
    label = formatDate(dueIso, { month: 'short', day: 'numeric' });
  }

  return (
    <Chip tone={tone}>
      <CalendarDays className="w-3 h-3 mr-1 inline" strokeWidth={2} />
      {label}
    </Chip>
  );
}

function EmptyState() {
  return (
    <div className="text-center">
      <p
        className="font-display text-xl text-ink"
        style={{ fontVariationSettings: '"opsz" 24' }}
      >
        No homework yet.
      </p>
      <p className="mt-1 text-[13px] text-ink-muted">
        Try a different filter, or post a new assignment.
      </p>
    </div>
  );
}
