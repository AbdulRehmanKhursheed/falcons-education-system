'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownUp,
  Archive,
  Download,
  Move,
  X,
} from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toast';
import { formatPKR, formatPercent } from '@/lib/format';
import { cn } from '@/lib/cn';
import {
  searchStudents,
  bulkArchiveStudents,
  bulkExportCsv,
  bulkMoveClassroom,
  type BulkClassroomOption,
} from '@/app/(app)/students/_actions';
import { useUrlState } from '@/hooks/useUrlState';
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
  /** Full classroom list with IDs — used by the "Move to classroom" bulk action. */
  classroomOptions?: BulkClassroomOption[];
  /** Only admins can run mutating bulk actions. */
  canManage?: boolean;
};

const PAGE_SIZE = 50;

export function StudentsTable({
  initialRows,
  initialTotal,
  classrooms,
  classroomOptions = [],
  canManage = false,
}: Props) {
  const { get, set } = useUrlState();

  // Seed state from the URL. If no URL params, fall back to neutral defaults.
  const urlQuery = get('query');
  const urlClassroom = get('classroom') || 'All';
  const urlPage = Math.max(1, parseInt(get('page') || '1', 10) || 1);

  const [query, setQuery] = useState(urlQuery);
  const [classroomFilter, setClassroomFilter] = useState<string>(urlClassroom);
  const [rows, setRows] = useState<StudentRow[]>(initialRows);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(urlPage);
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [moveOpen, setMoveOpen] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── URL-sync: re-fetch on mount if URL params were set ──────────────────
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    if (urlQuery || urlClassroom !== 'All' || urlPage !== 1) {
      runSearch(urlQuery, urlClassroom, urlPage, /* skipUrl */ true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Surface the import flow's ?imported=N redirect as a toast ──────────
  const importedHandled = useRef(false);
  useEffect(() => {
    if (importedHandled.current) return;
    const importedRaw = searchParams.get('imported');
    if (!importedRaw) return;
    const count = parseInt(importedRaw, 10);
    if (!Number.isNaN(count) && count > 0) {
      showToast({
        kind: 'success',
        title: `Imported ${count} ${count === 1 ? 'student' : 'students'}.`,
        description: 'The new roll numbers are now searchable.',
      });
    }
    importedHandled.current = true;
    const next = new URLSearchParams(searchParams.toString());
    next.delete('imported');
    const qs = next.toString();
    router.replace(qs ? `/students?${qs}` : '/students', { scroll: false });
  }, [searchParams, router, showToast]);

  // ── Derived selection state for the header checkbox ────────────────────
  const allVisibleSelected = useMemo(() => {
    if (rows.length === 0) return false;
    return rows.every((r) => selectedIds.has(r.id));
  }, [rows, selectedIds]);

  const someVisibleSelected = useMemo(
    () => rows.some((r) => selectedIds.has(r.id)),
    [rows, selectedIds],
  );

  function runSearch(
    nextQuery: string,
    nextClassroom: string,
    nextPage: number,
    skipUrl = false,
  ) {
    if (!skipUrl) {
      set({
        query: nextQuery,
        classroom: nextClassroom === 'All' ? null : nextClassroom,
        page: nextPage > 1 ? nextPage : null,
      });
    }
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

  function toggleSelectAllVisible() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        for (const r of rows) next.delete(r.id);
      } else {
        for (const r of rows) next.add(r.id);
      }
      return next;
    });
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function handleArchive() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const ok = window.confirm(
      `Archive ${ids.length} ${ids.length === 1 ? 'student' : 'students'}? They'll be moved to inactive and removed from active rosters.`,
    );
    if (!ok) return;
    setBulkBusy(true);
    try {
      const res = await bulkArchiveStudents(ids);
      if (res.ok) {
        showToast({
          kind: 'success',
          title: `Archived ${res.count} ${res.count === 1 ? 'student' : 'students'}.`,
        });
        clearSelection();
        runSearch(query, classroomFilter, page, /* skipUrl */ true);
      } else {
        showToast({
          kind: 'error',
          title: 'Could not archive students.',
          description: res.error,
        });
      }
    } finally {
      setBulkBusy(false);
    }
  }

  async function handleExportCsv() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkBusy(true);
    try {
      const res = await bulkExportCsv(ids);
      if (!res.ok) {
        showToast({
          kind: 'error',
          title: 'CSV export failed.',
          description: res.error,
        });
        return;
      }
      const blob = new Blob([res.csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `students-${ts}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast({
        kind: 'success',
        title: `Exported ${res.count} ${res.count === 1 ? 'student' : 'students'} to CSV.`,
      });
    } finally {
      setBulkBusy(false);
    }
  }

  async function handleMove(classroomId: string) {
    const ids = Array.from(selectedIds);
    if (ids.length === 0 || !classroomId) return;
    setBulkBusy(true);
    setMoveOpen(false);
    try {
      const res = await bulkMoveClassroom(ids, classroomId);
      if (res.ok) {
        const classroomName =
          classroomOptions.find((c) => c.id === classroomId)?.name ?? 'classroom';
        showToast({
          kind: 'success',
          title: `Moved ${res.count} ${res.count === 1 ? 'student' : 'students'} to ${classroomName}.`,
        });
        clearSelection();
        runSearch(query, classroomFilter, page, /* skipUrl */ true);
      } else {
        showToast({
          kind: 'error',
          title: 'Could not move students.',
          description: res.error,
        });
      }
    } finally {
      setBulkBusy(false);
    }
  }

  const selectionCount = selectedIds.size;

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

      {/* Mobile cards — shown < md */}
      <div className="md:hidden divide-y divide-line-soft">
        {rows.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="font-display text-xl text-ink" style={{ fontVariationSettings: '"opsz" 24' }}>
              No students match.
            </p>
            <p className="mt-1 text-[13px] text-ink-muted">Try a different filter or search term.</p>
          </div>
        ) : (
          rows.map((s) => {
            const selected = selectedIds.has(s.id);
            return (
              <div
                key={s.id}
                className={cn(
                  'relative block transition-colors',
                  selected ? 'bg-brand-soft/30' : 'hover:bg-surface-2 active:bg-surface-2',
                )}
              >
                <label
                  className="absolute top-3 right-3 z-10 flex items-center justify-center w-7 h-7 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    aria-label={`Select ${s.name}`}
                    checked={selected}
                    onChange={() => toggleSelected(s.id)}
                    className="w-4 h-4 accent-ink"
                  />
                </label>
                <Link href={`/students/${s.id}`} className="block px-4 py-3.5 pr-12">
                  <div className="flex items-start gap-3">
                    <Avatar name={s.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 pr-6">
                        <div className="min-w-0">
                          <p className="font-semibold text-ink text-[14px] truncate">{s.name}</p>
                          <p className="font-mono text-[11px] text-ink-faint tabular truncate mt-0.5">
                            {s.rollNo} · {s.classroom}
                          </p>
                        </div>
                        <Chip tone={statusTone[s.status]} className="shrink-0">{statusLabel[s.status]}</Chip>
                      </div>

                      <p className="mt-2 text-[12.5px] text-ink-soft truncate">
                        {s.guardian}
                        <span className="text-ink-faint"> · </span>
                        <span className="font-mono text-[11.5px] tabular">{s.guardianPhone}</span>
                      </p>

                      <div className="mt-2 flex items-center gap-4 text-[11.5px]">
                        <span className="eyebrow text-ink-faint">
                          Att <span className="tabular text-ink font-semibold normal-case tracking-normal ml-1">
                            {formatPercent(s.attendance30d, 0)}
                          </span>
                        </span>
                        <span className="eyebrow text-ink-faint">
                          Dues <span className={cn(
                            'tabular font-semibold normal-case tracking-normal ml-1',
                            s.duesPKR > 0 ? 'text-danger' : 'text-ink-faint'
                          )}>
                            {s.duesPKR > 0 ? formatPKR(s.duesPKR) : '—'}
                          </span>
                        </span>
                        <ArrowUpRight className="ml-auto w-3.5 h-3.5 text-ink-faint" strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop table — md+ */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="bg-surface-2 border-b border-line-soft">
            <tr className="text-left">
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  aria-label={allVisibleSelected ? 'Deselect all on this page' : 'Select all on this page'}
                  checked={allVisibleSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = !allVisibleSelected && someVisibleSelected;
                  }}
                  onChange={toggleSelectAllVisible}
                  className="w-4 h-4 accent-ink align-middle"
                />
              </th>
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
                <td colSpan={9} className="px-5 py-16 text-center">
                  <p className="font-display text-xl text-ink" style={{ fontVariationSettings: '"opsz" 24' }}>
                    No students match.
                  </p>
                  <p className="mt-1 text-[13px] text-ink-muted">Try a different filter or search term.</p>
                </td>
              </tr>
            )}

            {rows.map((s) => {
              const selected = selectedIds.has(s.id);
              return (
                <tr
                  key={s.id}
                  className={cn(
                    'group transition-colors',
                    selected ? 'bg-brand-soft/40' : 'hover:bg-surface-2',
                  )}
                >
                  <td className="px-3 py-3 align-middle">
                    <input
                      type="checkbox"
                      aria-label={`Select ${s.name}`}
                      checked={selected}
                      onChange={() => toggleSelected(s.id)}
                      className="w-4 h-4 accent-ink"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/students/${s.id}`}
                      className="flex items-center gap-3 min-w-0 hover:text-ink"
                    >
                      <Avatar name={s.name} size="sm" />
                      <span className="font-semibold text-ink truncate">{s.name}</span>
                    </Link>
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
                    <Link
                      href={`/students/${s.id}`}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-ink-faint group-hover:text-ink group-hover:bg-surface-3 transition-all"
                      aria-label={`Open ${s.name}`}
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

      {/* Bulk action bar — sticky at the bottom of the viewport */}
      {selectionCount > 0 && (
        <div
          role="region"
          aria-label="Bulk actions"
          className="no-print fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl"
        >
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 rounded-lg border border-ink bg-ink text-paper px-3.5 py-2.5 shadow-[var(--shadow-float)]">
            <span className="text-[12.5px] font-semibold tabular">
              {selectionCount} selected
            </span>
            <span className="hidden sm:inline-block h-4 w-px bg-paper/20" />
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={bulkBusy}
              className="inline-flex items-center gap-1.5 rounded-md border border-paper/20 bg-ink-soft/40 px-2.5 py-1.5 text-[12px] font-semibold text-paper hover:bg-paper/10 disabled:opacity-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" strokeWidth={2} />
              Export CSV
            </button>
            {canManage && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMoveOpen((v) => !v)}
                  disabled={bulkBusy || classroomOptions.length === 0}
                  aria-haspopup="menu"
                  aria-expanded={moveOpen}
                  className="inline-flex items-center gap-1.5 rounded-md border border-paper/20 bg-ink-soft/40 px-2.5 py-1.5 text-[12px] font-semibold text-paper hover:bg-paper/10 disabled:opacity-50 transition-colors"
                >
                  <Move className="w-3.5 h-3.5" strokeWidth={2} />
                  Move to…
                </button>
                {moveOpen && (
                  <div
                    role="menu"
                    className="absolute bottom-full mb-2 right-0 w-56 max-h-64 overflow-auto rounded-md border border-line bg-surface text-ink-soft shadow-[var(--shadow-menu)] py-1"
                  >
                    {classroomOptions.length === 0 ? (
                      <p className="px-3 py-2 text-[12px] italic text-ink-faint">
                        No classrooms available.
                      </p>
                    ) : (
                      classroomOptions.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          role="menuitem"
                          onClick={() => handleMove(c.id)}
                          className="w-full text-left px-3 py-1.5 text-[12.5px] hover:bg-surface-2 text-ink"
                        >
                          {c.name}
                          <span className="ml-2 text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
                            {c.programKind.toLowerCase().replace(/_/g, ' ')}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
            {canManage && (
              <button
                type="button"
                onClick={handleArchive}
                disabled={bulkBusy}
                className="inline-flex items-center gap-1.5 rounded-md border border-danger/40 bg-danger/20 px-2.5 py-1.5 text-[12px] font-semibold text-paper hover:bg-danger/30 disabled:opacity-50 transition-colors"
              >
                <Archive className="w-3.5 h-3.5" strokeWidth={2} />
                Archive
              </button>
            )}
            <button
              type="button"
              onClick={clearSelection}
              className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[12px] font-semibold text-paper/80 hover:text-paper transition-colors"
            >
              <X className="w-3 h-3" strokeWidth={2} />
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ArrowUpDown() {
  return <ArrowDownUp className="w-3 h-3 opacity-40" strokeWidth={1.75} />;
}
