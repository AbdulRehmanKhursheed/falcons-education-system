'use client';

/**
 * Card-stacked feed of recent Montessori observations.
 * Each card is keyed by area (eyebrow), milestone (title), student + date (meta).
 */

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Filter, ArrowUpRight, Plus } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import { searchMontessoriObservations } from '@/app/(app)/assessments/_browse-actions';
import type { MontessoriObservationRow } from '@/lib/queries/assessments';

type Classroom = { id: string; name: string };

type Props = {
  initialRows: MontessoriObservationRow[];
  initialTotal: number;
  classrooms: Classroom[];
};

const areaTone: Record<string, Parameters<typeof Chip>[0]['tone']> = {
  'Practical Life': 'brand',
  Sensorial: 'info',
  Language: 'accent',
  Math: 'warn',
  Cultural: 'brand',
  Social: 'success',
  Motor: 'info',
};

export function MontessoriObservationsList({
  initialRows,
  initialTotal,
  classrooms,
}: Props) {
  const [rows, setRows] = useState(initialRows);
  const [total, setTotal] = useState(initialTotal);
  const [classroomId, setClassroomId] = useState<string>('All');
  const [isPending, startTransition] = useTransition();

  function applyFilter(next: string) {
    setClassroomId(next);
    startTransition(async () => {
      const res = await searchMontessoriObservations(next);
      setRows(res.rows);
      setTotal(res.total);
    });
  }

  const options: Classroom[] = [{ id: 'All', name: 'All' }, ...classrooms];

  return (
    <div className="space-y-4">
      <div className="bg-surface border border-line rounded-lg flex flex-wrap items-center gap-3 px-5 py-3.5">
        <div className="flex items-center gap-1 text-[11.5px] font-semibold text-ink-faint">
          <Filter className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span className="uppercase tracking-[0.14em]">Classroom</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {options.map((c) => {
            const active = classroomId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => applyFilter(c.id)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition-colors',
                  active
                    ? 'bg-ink text-paper border-ink'
                    : 'bg-surface-2 text-ink-soft border-line hover:border-ink-faint hover:text-ink',
                )}
              >
                {c.name}
              </button>
            );
          })}
        </div>
        <p className="ml-auto text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint tabular">
          {isPending ? 'Loading…' : `${rows.length} of ${total}`}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-surface border border-line rounded-lg px-5 py-16 text-center">
          <p
            className="font-display text-xl text-ink"
            style={{ fontVariationSettings: '"opsz" 24' }}
          >
            No observations yet.
          </p>
          <p className="mt-1 text-[13px] text-ink-muted">
            Log what you see in the prepared environment — practical life,
            sensorial, language, math.
          </p>
          <Link
            href="/assessments/new?kind=montessori"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.25} />
            Add observation
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rows.map((r) => (
            <li key={r.id}>
              <Link
                href={`/assessments/${r.id}`}
                className="group block bg-surface border border-line rounded-lg p-5 hover:border-line-strong transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Chip tone={areaTone[r.area] ?? 'neutral'}>{r.area}</Chip>
                    {r.term && (
                      <span className="text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
                        {r.term}
                      </span>
                    )}
                  </div>
                  <ArrowUpRight
                    className="w-3.5 h-3.5 text-ink-faint group-hover:text-ink group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                    strokeWidth={2}
                  />
                </div>

                <h3
                  className="font-display text-lg text-ink leading-snug mb-2"
                  style={{ fontVariationSettings: '"opsz" 24' }}
                >
                  {r.milestone}
                </h3>

                {r.notesSnippet && (
                  <p className="text-[13px] text-ink-muted leading-relaxed line-clamp-2 mb-4">
                    {r.notesSnippet}
                  </p>
                )}

                <footer className="flex items-center justify-between gap-3 pt-3 border-t border-line-soft">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={r.studentName} size="sm" />
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold text-ink truncate">
                        {r.studentName}
                      </p>
                      <p className="text-[11px] text-ink-faint truncate">
                        {r.classroom ?? '—'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-ink-faint tabular">
                      {formatDate(r.assessedAt, { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-[10.5px] text-ink-faint truncate max-w-[140px]">
                      by {r.assessedByName}
                    </p>
                  </div>
                </footer>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
