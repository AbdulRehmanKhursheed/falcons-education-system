'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import {
  Search,
  ArrowUpRight,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/cn';
import { searchTeachers } from '@/app/(app)/teachers/_search';
import type { TeacherListRow } from '@/lib/queries/teachers';

type Props = {
  initialRows: TeacherListRow[];
  initialTotal: number;
};

export function TeachersGrid({ initialRows, initialTotal }: Props) {
  const [query, setQuery] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [rows, setRows] = useState<TeacherListRow[]>(initialRows);
  const [total, setTotal] = useState(initialTotal);
  const [isPending, startTransition] = useTransition();

  function runSearch(nextQuery: string, nextActiveOnly: boolean) {
    startTransition(async () => {
      const res = await searchTeachers(nextQuery, nextActiveOnly);
      setRows(res.rows);
      setTotal(res.total);
    });
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    runSearch(value, activeOnly);
  }

  function handleActiveToggle() {
    const next = !activeOnly;
    setActiveOnly(next);
    runSearch(query, next);
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="bg-surface border border-line rounded-lg flex flex-wrap items-center gap-3 px-5 py-4 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint"
            strokeWidth={1.75}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search name or email…"
            className="w-full pl-9 pr-4 py-2 rounded-md border border-line bg-surface-2 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink focus:bg-surface transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={handleActiveToggle}
          className={cn(
            'px-3 py-1.5 rounded-full text-[11.5px] font-semibold border transition-colors',
            activeOnly
              ? 'bg-ink text-paper border-ink'
              : 'bg-surface-2 text-ink-soft border-line hover:border-ink-faint hover:text-ink',
          )}
        >
          Active only
        </button>

        <p className="ml-auto text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint tabular">
          {isPending ? 'Searching…' : `${rows.length} of ${total}`}
        </p>
      </div>

      {/* Grid */}
      {rows.length === 0 ? (
        <div className="bg-surface border border-line rounded-lg px-5 py-16 text-center">
          <p
            className="font-display text-xl text-ink"
            style={{ fontVariationSettings: '"opsz" 24' }}
          >
            No teachers match.
          </p>
          <p className="mt-1 text-[13px] text-ink-muted">
            Try a different search term or toggle the active filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {rows.map((t) => (
            <TeacherCard key={t.id} teacher={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function TeacherCard({ teacher }: { teacher: TeacherListRow }) {
  return (
    <article className="group bg-surface border border-line rounded-lg p-5 hover:border-line-strong transition-colors flex flex-col">
      <div className="flex items-start gap-3 mb-4">
        <Avatar name={teacher.name} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink truncate text-[14px]">
            {teacher.name}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <Chip tone={teacher.isActive ? 'success' : 'neutral'}>
              {teacher.isActive ? 'Active' : 'Inactive'}
            </Chip>
            <Chip tone="brand">Teacher</Chip>
          </div>
        </div>
        <Link
          href={`/teachers/${teacher.id}`}
          aria-label={`View ${teacher.name}`}
          className="inline-flex items-center justify-center w-7 h-7 rounded-md text-ink-faint group-hover:text-ink group-hover:bg-surface-3 transition-all"
        >
          <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
        </Link>
      </div>

      <dl className="space-y-2 text-[12.5px]">
        <div className="flex items-center gap-2 text-ink-soft min-w-0">
          <Mail className="w-3.5 h-3.5 text-ink-faint shrink-0" strokeWidth={1.75} />
          <dd className="truncate font-mono text-[12px] tabular">{teacher.email}</dd>
        </div>
        <div className="flex items-center gap-2 text-ink-soft min-w-0">
          <Phone className="w-3.5 h-3.5 text-ink-faint shrink-0" strokeWidth={1.75} />
          <dd className="truncate font-mono text-[12px] tabular">
            {teacher.phone ?? '—'}
          </dd>
        </div>
        <div className="flex items-start gap-2 text-ink-soft min-w-0">
          <GraduationCap
            className="w-3.5 h-3.5 text-ink-faint shrink-0 mt-0.5"
            strokeWidth={1.75}
          />
          <dd className="truncate">{teacher.qualification ?? '—'}</dd>
        </div>
      </dl>

      <div className="mt-4 pt-4 border-t border-line-soft">
        <p className="eyebrow text-ink-faint mb-2 inline-flex items-center gap-1.5">
          <BookOpen className="w-3 h-3" strokeWidth={1.75} />
          Homerooms
        </p>
        {teacher.homerooms.length === 0 ? (
          <p className="text-[12px] text-ink-faint italic">No homeroom assigned</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {teacher.homerooms.map((h) => (
              <li
                key={h.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-2 border border-line-soft text-[11.5px] font-semibold text-ink"
              >
                {h.name}
                <span className="text-ink-faint tabular">{h.studentCount}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
