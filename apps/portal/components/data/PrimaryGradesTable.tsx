'use client';

/**
 * Tabular view of Primary grade assessments, with classroom / term / subject
 * filters. Mirrors the visual rhythm of StudentsTable.
 */

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Filter, ArrowUpRight, ArrowDownUp } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import { searchPrimaryGrades } from '@/app/(app)/assessments/_browse-actions';
import type { PrimaryGradeRow } from '@/lib/queries/assessments';

type Classroom = { id: string; name: string };

type Props = {
  initialRows: PrimaryGradeRow[];
  initialTotal: number;
  classrooms: Classroom[];
  terms: string[];
  subjects: string[];
};

const gradeTone: Record<string, Parameters<typeof Chip>[0]['tone']> = {
  'A+': 'success',
  A: 'success',
  'B+': 'info',
  B: 'info',
  C: 'warn',
  F: 'danger',
};

export function PrimaryGradesTable({
  initialRows,
  initialTotal,
  classrooms,
  terms,
  subjects,
}: Props) {
  const [rows, setRows] = useState(initialRows);
  const [total, setTotal] = useState(initialTotal);
  const [classroomId, setClassroomId] = useState<string>('All');
  const [term, setTerm] = useState<string>('All');
  const [subject, setSubject] = useState<string>('All');
  const [isPending, startTransition] = useTransition();

  function run(next: { classroomId?: string; term?: string; subject?: string }) {
    const merged = {
      classroomId: next.classroomId ?? classroomId,
      term: next.term ?? term,
      subject: next.subject ?? subject,
    };
    setClassroomId(merged.classroomId);
    setTerm(merged.term);
    setSubject(merged.subject);
    startTransition(async () => {
      const res = await searchPrimaryGrades(merged);
      setRows(res.rows);
      setTotal(res.total);
    });
  }

  const classroomOptions: Classroom[] = [{ id: 'All', name: 'All' }, ...classrooms];

  return (
    <div className="bg-surface border border-line rounded-lg">
      <div className="flex flex-wrap items-center gap-4 px-5 py-4 border-b border-line-soft">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-ink-faint">
            <Filter className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span className="uppercase tracking-[0.14em]">Class</span>
          </span>
          <div className="flex flex-wrap gap-1">
            {classroomOptions.map((c) => {
              const active = classroomId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => run({ classroomId: c.id })}
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
        </div>

        <label className="inline-flex items-center gap-2 text-[11.5px] font-semibold text-ink-faint">
          <span className="uppercase tracking-[0.14em]">Term</span>
          <select
            value={term}
            onChange={(e) => run({ term: e.target.value })}
            className="rounded-md border border-line bg-surface-2 px-2.5 py-1 text-[12.5px] text-ink focus:outline-none focus:border-ink"
          >
            <option value="All">All</option>
            {terms.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
            Subject
          </span>
          <div className="flex flex-wrap gap-1">
            {['All', ...subjects].map((s) => {
              const active = subject === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => run({ subject: s })}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition-colors',
                    active
                      ? 'bg-ink text-paper border-ink'
                      : 'bg-surface-2 text-ink-soft border-line hover:border-ink-faint hover:text-ink',
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <p className="ml-auto text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint tabular">
          {isPending ? 'Searching…' : `${rows.length} of ${total}`}
        </p>
      </div>

      {/* Mobile cards — shown < md */}
      <div className="md:hidden divide-y divide-line-soft">
        {rows.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p
              className="font-display text-xl text-ink"
              style={{ fontVariationSettings: '"opsz" 24' }}
            >
              No grades to show.
            </p>
            <p className="mt-1 text-[13px] text-ink-muted">
              Try a different filter or record a new assessment.
            </p>
          </div>
        ) : (
          rows.map((r) => (
            <Link
              key={r.id}
              href={`/assessments/${r.id}`}
              className="block px-4 py-3.5 active:bg-surface-2 hover:bg-surface-2 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Avatar name={r.studentName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink text-[14px] truncate">
                        {r.studentName}
                      </p>
                      <p className="font-mono text-[11px] text-ink-faint tabular truncate mt-0.5">
                        {r.rollNo} &middot; {r.classroom ?? '—'}
                      </p>
                    </div>
                    {r.grade ? (
                      <Chip tone={gradeTone[r.grade] ?? 'neutral'} className="shrink-0">
                        {r.grade}
                      </Chip>
                    ) : (
                      <span className="text-ink-faint shrink-0">—</span>
                    )}
                  </div>

                  <p className="mt-2 text-[12.5px] text-ink-soft truncate">
                    <span className="text-ink">{r.subject}</span>
                    <span className="text-ink-faint"> &middot; </span>
                    {r.term}
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-3 text-[11.5px]">
                    <span className="text-ink tabular font-semibold">
                      {r.score !== null && r.scoreMax !== null ? (
                        <>
                          {r.score}
                          <span className="text-ink-faint font-normal">
                            {' '}/ {r.scoreMax}
                          </span>
                          {r.scorePct !== null && (
                            <span className="ml-2 text-[10.5px] text-ink-faint font-normal">
                              {r.scorePct.toFixed(1)}%
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-ink-faint">—</span>
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-ink-faint tabular">
                      {formatDate(r.assessedAt, { month: 'short', day: 'numeric' })}
                      <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Desktop table — md+ */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="bg-surface-2 border-b border-line-soft">
            <tr className="text-left">
              {[
                { label: 'Student', sortable: true },
                { label: 'Roll', sortable: false },
                { label: 'Class', sortable: false },
                { label: 'Term', sortable: true },
                { label: 'Subject', sortable: false },
                { label: 'Score', sortable: true, align: 'right' as const },
                { label: 'Grade', sortable: false },
                { label: 'Assessed', sortable: true, align: 'right' as const },
                { label: '', sortable: false, align: 'right' as const },
              ].map((col, i) => (
                <th
                  key={i}
                  className={cn(
                    'px-4 py-3 eyebrow text-ink-faint font-semibold whitespace-nowrap',
                    col.align === 'right' && 'text-right',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5',
                      col.align === 'right' && 'flex-row-reverse',
                    )}
                  >
                    {col.label}
                    {col.sortable && (
                      <ArrowDownUp className="w-3 h-3 opacity-40" strokeWidth={1.75} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-line-soft">
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-16 text-center">
                  <p
                    className="font-display text-xl text-ink"
                    style={{ fontVariationSettings: '"opsz" 24' }}
                  >
                    No grades to show.
                  </p>
                  <p className="mt-1 text-[13px] text-ink-muted">
                    Try a different filter or record a new assessment.
                  </p>
                </td>
              </tr>
            )}

            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-surface-2 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={r.studentName} size="sm" />
                    <span className="font-semibold text-ink truncate">{r.studentName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-ink-muted text-[12px] tabular">
                  {r.rollNo}
                </td>
                <td className="px-4 py-3 text-ink-soft">{r.classroom ?? '—'}</td>
                <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{r.term}</td>
                <td className="px-4 py-3 text-ink">{r.subject}</td>
                <td className="px-4 py-3 text-right tabular text-ink font-semibold">
                  {r.score !== null && r.scoreMax !== null ? (
                    <>
                      <span>{r.score}</span>
                      <span className="text-ink-faint font-normal">
                        {' '}
                        / {r.scoreMax}
                      </span>
                      {r.scorePct !== null && (
                        <span className="block text-[10.5px] text-ink-faint font-normal">
                          {r.scorePct.toFixed(1)}%
                        </span>
                      )}
                    </>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-3">
                  {r.grade ? (
                    <Chip tone={gradeTone[r.grade] ?? 'neutral'}>{r.grade}</Chip>
                  ) : (
                    <span className="text-ink-faint">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-ink-soft tabular whitespace-nowrap">
                  {formatDate(r.assessedAt, { month: 'short', day: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/assessments/${r.id}`}
                    aria-label={`Open ${r.studentName} · ${r.subject}`}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-md text-ink-faint group-hover:text-ink group-hover:bg-surface-3 transition-all"
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
