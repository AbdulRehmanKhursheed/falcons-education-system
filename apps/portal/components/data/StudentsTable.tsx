'use client';

import { useState, useTransition } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownUp } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import { formatPKR, formatPercent } from '@/lib/format';
import { cn } from '@/lib/cn';
import { searchStudents } from '@/app/(app)/students/_actions';
import type { StudentRow } from '@/lib/queries/students';

const statusTone: Record<StudentRow['status'], Parameters<typeof Chip>[0]['tone']> = {
  active:    'success',
  'on-leave': 'warn',
  inactive:  'danger',
};

const statusLabel: Record<StudentRow['status'], string> = {
  active:    'Active',
  'on-leave': 'On leave',
  inactive:  'Inactive',
};

type Props = {
  initialRows: StudentRow[];
  initialTotal: number;
  classrooms: string[];
};

const PAGE_SIZE = 50;

export function StudentsTable({ initialRows, initialTotal, classrooms }: Props) {
  const [query, setQuery] = useState('');
  const [classroomFilter, setClassroomFilter] = useState<string>('All');
  const [rows, setRows] = useState<StudentRow[]>(initialRows);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function runSearch(nextQuery: string, nextClassroom: string, nextPage: number) {
    startTransition(async () => {
      const res = await searchStudents(nextQuery, nextClassroom, nextPage);
      setRows(res.rows);
      setTotal(res.total);
      setPage(res.page);
    });
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
    runSearch(value, classroomFilter, 1);
  }

  function handleClassroomChange(c: string) {
    setClassroomFilter(c);
    setPage(1);
    runSearch(query, c, 1);
  }

  function handlePageChange(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages) return;
    runSearch(query, classroomFilter, nextPage);
  }

  return (
    <div className="bg-surface border border-line rounded-lg">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-line-soft">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint" strokeWidth={1.75} />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search name, roll no, guardian…"
            className="w-full pl-9 pr-4 py-2 rounded-md border border-line bg-surface-2 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink focus:bg-surface transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 text-[11.5px] font-semibold text-ink-faint">
          <Filter className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span className="uppercase tracking-[0.14em]">Classroom</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {classrooms.map((c) => {
            const active = classroomFilter === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => handleClassroomChange(c)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition-colors',
                  active
                    ? 'bg-ink text-paper border-ink'
                    : 'bg-surface-2 text-ink-soft border-line hover:border-ink-faint hover:text-ink'
                )}
              >
                {c}
              </button>
            );
          })}
        </div>

        <p className="ml-auto text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint tabular">
          {isPending ? 'Searching…' : `${rows.length} of ${total}`}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="bg-surface-2 border-b border-line-soft">
            <tr className="text-left">
              {[
                { label: 'Student',     sortable: true  },
                { label: 'Roll no',     sortable: true  },
                { label: 'Classroom',   sortable: false },
                { label: 'Guardian',    sortable: false },
                { label: 'Attendance',  sortable: true, align: 'right' as const },
                { label: 'Dues',        sortable: true, align: 'right' as const },
                { label: 'Status',      sortable: false },
                { label: '',            sortable: false, align: 'right' as const },
              ].map((col, i) => (
                <th
                  key={i}
                  className={cn(
                    'px-5 py-3 eyebrow text-ink-faint font-semibold whitespace-nowrap',
                    col.align === 'right' && 'text-right'
                  )}
                >
                  <span className={cn('inline-flex items-center gap-1.5', col.align === 'right' && 'flex-row-reverse')}>
                    {col.label}
                    {col.sortable && <ArrowUpDown />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-line-soft">
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center">
                  <p className="font-display text-xl text-ink" style={{ fontVariationSettings: '"opsz" 24' }}>
                    No students match.
                  </p>
                  <p className="mt-1 text-[13px] text-ink-muted">Try a different filter or search term.</p>
                </td>
              </tr>
            )}

            {rows.map((s) => (
              <tr key={s.id} className="hover:bg-surface-2 transition-colors group">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={s.name} size="sm" />
                    <span className="font-semibold text-ink truncate">{s.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 font-mono text-ink-muted text-[12px] tabular">{s.rollNo}</td>
                <td className="px-5 py-3 text-ink-soft">{s.classroom}</td>
                <td className="px-5 py-3 text-ink-soft min-w-0">
                  <div>
                    <p className="truncate">{s.guardian}</p>
                    <p className="font-mono text-[11px] text-ink-faint tabular truncate">{s.guardianPhone}</p>
                  </div>
                </td>
                <td className="px-5 py-3 text-right text-ink tabular font-semibold">
                  {formatPercent(s.attendance30d, 0)}
                </td>
                <td className={cn(
                  'px-5 py-3 text-right tabular font-semibold',
                  s.duesPKR > 0 ? 'text-danger' : 'text-ink-faint'
                )}>
                  {s.duesPKR > 0 ? formatPKR(s.duesPKR) : '—'}
                </td>
                <td className="px-5 py-3">
                  <Chip tone={statusTone[s.status]}>{statusLabel[s.status]}</Chip>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center w-7 h-7 rounded-md text-ink-faint group-hover:text-ink group-hover:bg-surface-3 transition-all"
                    aria-label={`Open ${s.name}`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-line-soft text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
        <span className="tabular">Page {page} of {totalPages}</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || isPending}
            className="px-2.5 py-1 rounded border border-line bg-surface-2 text-ink-soft hover:border-ink-faint hover:text-ink disabled:opacity-50 disabled:hover:border-line disabled:hover:text-ink-soft transition-colors"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages || isPending}
            className="px-2.5 py-1 rounded border border-line bg-surface-2 text-ink-soft hover:border-ink-faint hover:text-ink disabled:opacity-50 disabled:hover:border-line disabled:hover:text-ink-soft transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function ArrowUpDown() {
  return <ArrowDownUp className="w-3 h-3 opacity-40" strokeWidth={1.75} />;
}
