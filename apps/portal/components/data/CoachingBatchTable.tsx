'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search, Filter, Archive } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/cn';
import { formatPKR } from '@/lib/format';
import { useUrlState } from '@/hooks/useUrlState';
import type { CoachingBatchRow } from '@/lib/queries/coaching';

const levelLabel: Record<CoachingBatchRow['level'], string> = {
  MATRIC_9: 'Matric 9',
  MATRIC_10: 'Matric 10',
  FSC_1: 'FSc Part 1',
  FSC_2: 'FSc Part 2',
  O_LEVEL: 'O-Level',
  A_LEVEL: 'A-Level',
  MDCAT: 'MDCAT',
  ECAT: 'ECAT',
  GENERAL: 'General',
};

const weekdayShort: Record<CoachingBatchRow['weekdays'][number], string> = {
  MON: 'Mon',
  TUE: 'Tue',
  WED: 'Wed',
  THU: 'Thu',
  FRI: 'Fri',
  SAT: 'Sat',
  SUN: 'Sun',
};

function formatWeekdays(days: CoachingBatchRow['weekdays']): string {
  const order: Array<CoachingBatchRow['weekdays'][number]> = [
    'MON',
    'TUE',
    'WED',
    'THU',
    'FRI',
    'SAT',
    'SUN',
  ];
  return order
    .filter((d) => days.includes(d))
    .map((d) => weekdayShort[d])
    .join(' · ');
}

function formatTimeRange(start: string, end: string): string {
  return `${start} – ${end}`;
}

type Props = {
  initialRows: CoachingBatchRow[];
};

const LEVEL_FILTERS: Array<{ id: 'ALL' | CoachingBatchRow['level']; label: string }> = [
  { id: 'ALL', label: 'All levels' },
  { id: 'MATRIC_9', label: 'Matric 9' },
  { id: 'MATRIC_10', label: 'Matric 10' },
  { id: 'FSC_1', label: 'FSc 1' },
  { id: 'FSC_2', label: 'FSc 2' },
  { id: 'O_LEVEL', label: 'O-Level' },
  { id: 'A_LEVEL', label: 'A-Level' },
  { id: 'MDCAT', label: 'MDCAT' },
  { id: 'ECAT', label: 'ECAT' },
  { id: 'GENERAL', label: 'General' },
];

export function CoachingBatchTable({ initialRows }: Props) {
  const { get, set } = useUrlState();
  const urlQuery = get('q');
  const urlLevel = (get('level') || 'ALL') as 'ALL' | CoachingBatchRow['level'];

  const [query, setQuery] = useState(urlQuery);
  const [levelFilter, setLevelFilter] = useState<'ALL' | CoachingBatchRow['level']>(
    urlLevel,
  );

  function handleQueryChange(v: string) {
    setQuery(v);
    set({ q: v || null });
  }

  function handleLevelChange(l: 'ALL' | CoachingBatchRow['level']) {
    setLevelFilter(l);
    set({ level: l === 'ALL' ? null : l });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialRows.filter((b) => {
      if (levelFilter !== 'ALL' && b.level !== levelFilter) return false;
      if (!q) return true;
      return (
        b.name.toLowerCase().includes(q) ||
        b.subject.toLowerCase().includes(q)
      );
    });
  }, [initialRows, query, levelFilter]);

  return (
    <div className="bg-surface border border-line rounded-lg">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-line-soft">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint"
            strokeWidth={1.75}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search batch name or subject…"
            className="w-full pl-9 pr-4 py-2 rounded-md border border-line bg-surface-2 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink focus:bg-surface transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 text-[11.5px] font-semibold text-ink-faint">
          <Filter className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span className="uppercase tracking-[0.14em]">Level</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {LEVEL_FILTERS.map((opt) => {
            const active = levelFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleLevelChange(opt.id)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition-colors',
                  active
                    ? 'bg-ink text-paper border-ink'
                    : 'bg-surface-2 text-ink-soft border-line hover:border-ink-faint hover:text-ink',
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <p className="ml-auto text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint tabular">
          {filtered.length} of {initialRows.length}
        </p>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-line-soft">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          filtered.map((b) => <MobileRow key={b.id} batch={b} />)
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="bg-surface-2 border-b border-line-soft">
            <tr className="text-left">
              {[
                'Batch',
                'Subject',
                'Level',
                'Days · Time',
                'Teacher',
                'Capacity',
                'Monthly fee',
                'Status',
                '',
              ].map((label, i) => (
                <th
                  key={i}
                  className={cn(
                    'px-5 py-3 eyebrow text-ink-faint font-semibold whitespace-nowrap',
                    (i === 5 || i === 6) && 'text-right',
                  )}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-16">
                  <EmptyState />
                </td>
              </tr>
            )}
            {filtered.map((b) => {
              const pct = b.capacity > 0 ? (b.enrolledActive / b.capacity) * 100 : 0;
              const tone: Parameters<typeof Chip>[0]['tone'] =
                pct >= 100 ? 'danger' : pct >= 80 ? 'warn' : 'success';

              return (
                <tr key={b.id} className="group transition-colors hover:bg-surface-2">
                  <td className="px-5 py-3">
                    <Link
                      href={`/coaching/${b.id}`}
                      className="font-semibold text-ink hover:text-brand-dark"
                    >
                      {b.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{b.subject}</td>
                  <td className="px-5 py-3">
                    <Chip tone="neutral">{levelLabel[b.level]}</Chip>
                  </td>
                  <td className="px-5 py-3 text-ink-soft min-w-0">
                    <p className="truncate">{formatWeekdays(b.weekdays)}</p>
                    <p className="font-mono text-[11px] text-ink-faint tabular">
                      {formatTimeRange(b.startTime, b.endTime)}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">
                    {b.teacherName ?? (
                      <span className="italic text-ink-faint">Unassigned</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Chip tone={tone}>
                      <span className="tabular">
                        {b.enrolledActive}/{b.capacity}
                      </span>
                    </Chip>
                  </td>
                  <td className="px-5 py-3 text-right text-ink tabular font-semibold">
                    {formatPKR(b.monthlyFee)}
                  </td>
                  <td className="px-5 py-3">
                    {b.isActive ? (
                      <Chip tone="brand">Active</Chip>
                    ) : (
                      <Chip tone="neutral">
                        <span className="inline-flex items-center gap-1">
                          <Archive className="w-3 h-3" strokeWidth={2} />
                          Archived
                        </span>
                      </Chip>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/coaching/${b.id}`}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-ink-faint group-hover:text-ink group-hover:bg-surface-3 transition-all"
                      aria-label={`Open ${b.name}`}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MobileRow({ batch: b }: { batch: CoachingBatchRow }) {
  const pct = b.capacity > 0 ? (b.enrolledActive / b.capacity) * 100 : 0;
  const tone: Parameters<typeof Chip>[0]['tone'] =
    pct >= 100 ? 'danger' : pct >= 80 ? 'warn' : 'success';
  return (
    <Link
      href={`/coaching/${b.id}`}
      className="block px-4 py-3.5 hover:bg-surface-2 active:bg-surface-2 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-ink text-[14px] truncate">{b.name}</p>
          <p className="text-[12px] text-ink-soft mt-0.5 truncate">
            {b.subject}
            <span className="text-ink-faint"> · </span>
            {levelLabel[b.level]}
          </p>
        </div>
        <Chip tone={tone}>
          <span className="tabular">
            {b.enrolledActive}/{b.capacity}
          </span>
        </Chip>
      </div>
      <p className="mt-2 text-[12px] text-ink-soft">
        {formatWeekdays(b.weekdays)}
        <span className="text-ink-faint"> · </span>
        <span className="font-mono tabular">
          {formatTimeRange(b.startTime, b.endTime)}
        </span>
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[12px] text-ink-soft">
          {b.teacherName ?? (
            <span className="italic text-ink-faint">Unassigned</span>
          )}
        </span>
        <span className="text-[12px] tabular font-semibold text-ink">
          {formatPKR(b.monthlyFee)}
        </span>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="px-5 py-16 text-center">
      <p
        className="font-display text-xl text-ink"
        style={{ fontVariationSettings: '"opsz" 24' }}
      >
        No batches match.
      </p>
      <p className="mt-1 text-[13px] text-ink-muted">
        Try a different filter or create a new batch.
      </p>
    </div>
  );
}
