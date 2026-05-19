'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { Search, ArrowUpRight, ArrowDownUp, Filter, Plus } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import { formatPKR, formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { InvoiceRow } from '@/lib/queries/fees';
import {
  invoiceListStatuses,
  type InvoiceListStatus,
} from '@/lib/queries/fees';
import type { InvoiceStatus } from '@prisma/client';
import { searchInvoices } from '@/app/(app)/fees/_actions';
import { useUrlState } from '@/hooks/useUrlState';

const VALID_STATUSES = new Set<InvoiceListStatus>([
  'all',
  'issued',
  'partially_paid',
  'paid',
  'overdue',
  'cancelled',
]);

function coerceStatus(
  raw: string,
  fallback: InvoiceListStatus,
): InvoiceListStatus {
  return VALID_STATUSES.has(raw as InvoiceListStatus)
    ? (raw as InvoiceListStatus)
    : fallback;
}

const statusTone: Record<
  InvoiceStatus,
  Parameters<typeof Chip>[0]['tone']
> = {
  DRAFT: 'neutral',
  ISSUED: 'info',
  PARTIALLY_PAID: 'warn',
  PAID: 'success',
  OVERDUE: 'danger',
  CANCELLED: 'neutral',
};

const statusLabel: Record<InvoiceStatus, string> = {
  DRAFT: 'Draft',
  ISSUED: 'Issued',
  PARTIALLY_PAID: 'Partially paid',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled',
};

function formatMonth(monthYear: string) {
  const [y, m] = monthYear.split('-').map(Number);
  if (!y || !m) return monthYear;
  return new Date(y, m - 1, 1).toLocaleDateString('en-PK', {
    month: 'short',
    year: 'numeric',
  });
}

type Props = {
  initialRows: InvoiceRow[];
  initialTotal: number;
  classrooms: string[]; // includes 'All'
  months: string[]; // includes 'All'
  initialStatus: InvoiceListStatus;
  initialClassroom: string;
  initialMonth: string;
  initialQuery: string;
  canGenerate?: boolean;
};

export function InvoiceTable({
  initialRows,
  initialTotal,
  classrooms,
  months,
  initialStatus,
  initialClassroom,
  initialMonth,
  initialQuery,
  canGenerate = false,
}: Props) {
  const { get, set } = useUrlState();

  // URL-backed initial state (URL wins over server-provided initials).
  const seededStatus = coerceStatus(get('status') || initialStatus, initialStatus);
  const seededClassroom = get('classroom') || initialClassroom;
  const seededMonth = get('monthYear') || initialMonth;
  const seededQuery = get('query') || initialQuery;

  const [status, setStatus] = useState<InvoiceListStatus>(seededStatus);
  const [classroom, setClassroom] = useState(seededClassroom);
  const [month, setMonth] = useState(seededMonth);
  const [query, setQuery] = useState(seededQuery);
  const [rows, setRows] = useState<InvoiceRow[]>(initialRows);
  const [total, setTotal] = useState(initialTotal);
  const [isPending, startTransition] = useTransition();

  // If URL had params that diverge from the server-side initials, fetch on mount.
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    const drift =
      seededStatus !== initialStatus ||
      seededClassroom !== initialClassroom ||
      seededMonth !== initialMonth ||
      seededQuery !== initialQuery;
    if (drift) {
      runSearch(
        {
          status: seededStatus,
          classroom: seededClassroom,
          monthYear: seededMonth,
          query: seededQuery,
        },
        /* skipUrl */ true,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runSearch(
    next: {
      status: InvoiceListStatus;
      classroom: string;
      monthYear: string;
      query: string;
    },
    skipUrl = false,
  ) {
    if (!skipUrl) {
      set({
        status: next.status === 'all' ? null : next.status,
        classroom: next.classroom === 'All' ? null : next.classroom,
        monthYear: next.monthYear === 'All' ? null : next.monthYear,
        query: next.query,
        // Reset page to 1 (we keep `page` removed from the URL).
        page: null,
      });
    }
    startTransition(async () => {
      const res = await searchInvoices(next);
      setRows(res.rows);
      setTotal(res.total);
    });
  }

  function handleStatus(s: InvoiceListStatus) {
    setStatus(s);
    runSearch({ status: s, classroom, monthYear: month, query });
  }
  function handleClassroom(c: string) {
    setClassroom(c);
    runSearch({ status, classroom: c, monthYear: month, query });
  }
  function handleMonth(m: string) {
    setMonth(m);
    runSearch({ status, classroom, monthYear: m, query });
  }
  function handleQuery(q: string) {
    setQuery(q);
    runSearch({ status, classroom, monthYear: month, query: q });
  }

  return (
    <div className="bg-surface border border-line rounded-lg">
      {/* Status filter strip */}
      <div className="flex flex-wrap items-center gap-2 px-5 py-3.5 border-b border-line-soft">
        <div className="flex items-center gap-1 text-[11.5px] font-semibold text-ink-faint mr-1">
          <Filter className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span className="uppercase tracking-[0.14em]">Status</span>
        </div>
        {invoiceListStatuses.map((s) => {
          const active = status === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleStatus(s.id)}
              className={cn(
                'px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition-colors',
                active
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-surface-2 text-ink-soft border-line hover:border-ink-faint hover:text-ink',
              )}
            >
              {s.label}
            </button>
          );
        })}
        <p className="ml-auto text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint tabular">
          {isPending ? 'Searching…' : `${rows.length} of ${total}`}
        </p>
      </div>

      {/* Search + secondary filters */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 border-b border-line-soft">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint"
            strokeWidth={1.75}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQuery(e.target.value)}
            placeholder="Search invoice no, student, roll no…"
            className="w-full pl-9 pr-4 py-2 rounded-md border border-line bg-surface-2 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink focus:bg-surface transition-colors"
          />
        </div>

        <label className="flex items-center gap-2 text-[12px] text-ink-soft">
          <span className="eyebrow text-ink-faint">Classroom</span>
          <select
            value={classroom}
            onChange={(e) => handleClassroom(e.target.value)}
            className="rounded-md border border-line bg-surface-2 px-2.5 py-1.5 text-[12.5px] text-ink hover:border-ink-faint focus:outline-none focus:border-ink transition-colors"
          >
            {classrooms.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-[12px] text-ink-soft">
          <span className="eyebrow text-ink-faint">Month</span>
          <select
            value={month}
            onChange={(e) => handleMonth(e.target.value)}
            className="rounded-md border border-line bg-surface-2 px-2.5 py-1.5 text-[12.5px] text-ink hover:border-ink-faint focus:outline-none focus:border-ink transition-colors"
          >
            <option value="All">All months</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {formatMonth(m)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Mobile cards — shown < md */}
      <div className="md:hidden divide-y divide-line-soft">
        {rows.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p
              className="font-display text-xl text-ink"
              style={{ fontVariationSettings: '"opsz" 24' }}
            >
              No invoices match.
            </p>
            <p className="mt-1 text-[13px] text-ink-muted">
              Try a different filter or search term.
            </p>
            {canGenerate && (
              <Link
                href="/fees"
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2.25} />
                Generate this month&rsquo;s invoices
              </Link>
            )}
          </div>
        ) : (
          rows.map((inv) => {
            const isOverdueDueDate =
              inv.status !== 'PAID' &&
              inv.status !== 'CANCELLED' &&
              new Date(inv.dueDate).getTime() < Date.now();
            return (
              <Link
                key={inv.id}
                href={`/fees/${inv.id}`}
                className="block px-4 py-3.5 active:bg-surface-2 hover:bg-surface-2 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-mono text-[12px] text-ink font-semibold tabular truncate">
                    {inv.invoiceNo}
                  </p>
                  <Chip tone={statusTone[inv.status]} className="shrink-0">
                    {statusLabel[inv.status]}
                  </Chip>
                </div>

                <div className="flex items-start gap-3">
                  <Avatar name={inv.studentName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink text-[14px] truncate">
                      {inv.studentName}
                    </p>
                    <p className="font-mono text-[11px] text-ink-faint tabular truncate mt-0.5">
                      {inv.rollNo} &middot; {inv.classroom}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-[11.5px]">
                  <div>
                    <p className="eyebrow text-ink-faint">Month</p>
                    <p className="mt-0.5 text-ink-soft tabular">
                      {formatMonth(inv.monthYear)}
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow text-ink-faint">Amount</p>
                    <p className="mt-0.5 text-ink tabular font-semibold">
                      {formatPKR(inv.total)}
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow text-ink-faint">Due</p>
                    <p
                      className={cn(
                        'mt-0.5 tabular',
                        isOverdueDueDate
                          ? 'text-danger font-semibold'
                          : 'text-ink-soft',
                      )}
                    >
                      {formatDate(inv.dueDate, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {inv.amountPaid > 0 && (
                  <p
                    className={cn(
                      'mt-2 text-[11.5px] tabular',
                      inv.amountPaid >= inv.total
                        ? 'text-success'
                        : 'text-warn',
                    )}
                  >
                    <span className="eyebrow text-ink-faint">Paid</span>{' '}
                    <span className="font-semibold normal-case tracking-normal ml-1">
                      {formatPKR(inv.amountPaid)}
                    </span>
                  </p>
                )}
              </Link>
            );
          })
        )}
      </div>

      {/* Desktop table — md+ */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="bg-surface-2 border-b border-line-soft">
            <tr className="text-left">
              {[
                { label: 'Invoice no', sortable: true },
                { label: 'Student', sortable: true },
                { label: 'Classroom', sortable: false },
                { label: 'Month', sortable: true },
                { label: 'Amount', sortable: true, align: 'right' as const },
                { label: 'Paid', sortable: true, align: 'right' as const },
                { label: 'Status', sortable: false },
                { label: 'Due', sortable: true, align: 'right' as const },
                { label: '', sortable: false, align: 'right' as const },
              ].map((col, i) => (
                <th
                  key={i}
                  className={cn(
                    'px-5 py-3 eyebrow text-ink-faint font-semibold whitespace-nowrap',
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
                    {col.sortable && <SortIcon />}
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
                    No invoices match.
                  </p>
                  <p className="mt-1 text-[13px] text-ink-muted">
                    Try a different filter or search term.
                  </p>
                  {canGenerate && (
                    <Link
                      href="/fees"
                      className="mt-5 inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={2.25} />
                      Generate this month&rsquo;s invoices
                    </Link>
                  )}
                </td>
              </tr>
            )}

            {rows.map((inv) => {
              const isOverdueDueDate =
                inv.status !== 'PAID' &&
                inv.status !== 'CANCELLED' &&
                new Date(inv.dueDate).getTime() < Date.now();
              return (
                <tr
                  key={inv.id}
                  className="hover:bg-surface-2 transition-colors group"
                >
                  <td className="px-5 py-3 font-mono text-ink text-[12px] tabular">
                    {inv.invoiceNo}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={inv.studentName} size="sm" />
                      <div className="min-w-0">
                        <p className="font-semibold text-ink truncate">
                          {inv.studentName}
                        </p>
                        <p className="font-mono text-[11px] text-ink-faint tabular truncate">
                          {inv.rollNo}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{inv.classroom}</td>
                  <td className="px-5 py-3 text-ink-soft tabular">
                    {formatMonth(inv.monthYear)}
                  </td>
                  <td className="px-5 py-3 text-right text-ink tabular font-semibold">
                    {formatPKR(inv.total)}
                  </td>
                  <td
                    className={cn(
                      'px-5 py-3 text-right tabular font-semibold',
                      inv.amountPaid === 0
                        ? 'text-ink-faint'
                        : inv.amountPaid >= inv.total
                          ? 'text-success'
                          : 'text-warn',
                    )}
                  >
                    {inv.amountPaid > 0 ? formatPKR(inv.amountPaid) : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <Chip tone={statusTone[inv.status]}>
                      {statusLabel[inv.status]}
                    </Chip>
                  </td>
                  <td
                    className={cn(
                      'px-5 py-3 text-right tabular',
                      isOverdueDueDate
                        ? 'text-danger font-semibold'
                        : 'text-ink-soft',
                    )}
                  >
                    {formatDate(inv.dueDate, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/fees/${inv.id}`}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-ink-faint group-hover:text-ink group-hover:bg-surface-3 transition-all"
                      aria-label={`Open invoice ${inv.invoiceNo}`}
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

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-line-soft text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
        <span>
          Showing the latest {rows.length} of {total} matching invoice
          {total === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  );
}

function SortIcon() {
  return <ArrowDownUp className="w-3 h-3 opacity-40" strokeWidth={1.75} />;
}
