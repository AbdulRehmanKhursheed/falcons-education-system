'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Search, ArrowUpRight, ArrowDownUp, Filter } from 'lucide-react';
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
}: Props) {
  const [status, setStatus] = useState<InvoiceListStatus>(initialStatus);
  const [classroom, setClassroom] = useState(initialClassroom);
  const [month, setMonth] = useState(initialMonth);
  const [query, setQuery] = useState(initialQuery);
  const [rows, setRows] = useState<InvoiceRow[]>(initialRows);
  const [total, setTotal] = useState(initialTotal);
  const [isPending, startTransition] = useTransition();

  function runSearch(next: {
    status: InvoiceListStatus;
    classroom: string;
    monthYear: string;
    query: string;
  }) {
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

      {/* Table */}
      <div className="overflow-x-auto">
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
