'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Search, ArrowUpRight, MessageCircle, ArrowDownUp } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/cn';
import { searchGuardians } from '@/app/(app)/parents/_search';
import { waLink } from './ParentContactHelpers';
import type { GuardianRow } from '@/lib/queries/parents';

const relationTone: Record<string, Parameters<typeof Chip>[0]['tone']> = {
  Father: 'info',
  Mother: 'accent',
  Guardian: 'brand',
};

type Props = {
  initialRows: GuardianRow[];
  initialTotal: number;
  relations: string[];
};

export function ParentsTable({ initialRows, initialTotal, relations }: Props) {
  const [query, setQuery] = useState('');
  const [relation, setRelation] = useState<string>('All');
  const [rows, setRows] = useState<GuardianRow[]>(initialRows);
  const [total, setTotal] = useState(initialTotal);
  const [isPending, startTransition] = useTransition();

  function runSearch(nextQuery: string, nextRelation: string) {
    startTransition(async () => {
      const res = await searchGuardians(nextQuery, nextRelation);
      setRows(res.rows);
      setTotal(res.total);
    });
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    runSearch(value, relation);
  }

  function handleRelationChange(value: string) {
    setRelation(value);
    runSearch(query, value);
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
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search name or phone…"
            className="w-full pl-9 pr-4 py-2 rounded-md border border-line bg-surface-2 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink focus:bg-surface transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 text-[11.5px] font-semibold text-ink-faint">
          <span className="uppercase tracking-[0.14em]">Relation</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {relations.map((r) => {
            const active = relation === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => handleRelationChange(r)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition-colors',
                  active
                    ? 'bg-ink text-paper border-ink'
                    : 'bg-surface-2 text-ink-soft border-line hover:border-ink-faint hover:text-ink',
                )}
              >
                {r}
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
            <p
              className="font-display text-xl text-ink"
              style={{ fontVariationSettings: '"opsz" 24' }}
            >
              No guardians yet.
            </p>
            <p className="mt-1 text-[13px] text-ink-muted">
              Guardians are added when you onboard a student.
            </p>
            <Link
              href="/students"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.25} />
              Go to students
            </Link>
          </div>
        ) : (
          rows.map((g) => (
            <Link
              key={g.id}
              href={`/parents/${g.id}`}
              className="block px-4 py-3.5 active:bg-surface-2 hover:bg-surface-2 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Avatar name={g.fullName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink text-[14px] truncate">
                        {g.fullName}
                      </p>
                      <div className="mt-1 inline-flex flex-wrap items-center gap-1.5">
                        <Chip
                          tone={relationTone[g.relation] ?? 'neutral'}
                          className="!py-0"
                        >
                          {g.relation}
                        </Chip>
                        {g.isPrimary && (
                          <Chip tone="success" className="!py-0">
                            Primary
                          </Chip>
                        )}
                      </div>
                    </div>
                    <ArrowUpRight
                      className="w-3.5 h-3.5 text-ink-faint shrink-0 mt-1"
                      strokeWidth={2}
                    />
                  </div>

                  <p className="mt-2 font-mono text-[12px] text-ink-soft tabular truncate">
                    {g.phone}
                  </p>
                  {g.whatsapp && (
                    <a
                      href={waLink(g.whatsapp) ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 inline-flex items-center gap-1.5 font-mono text-[12px] text-success tabular hover:underline decoration-success/40 underline-offset-[5px]"
                    >
                      <MessageCircle className="w-3 h-3" strokeWidth={2} />
                      {g.whatsapp}
                    </a>
                  )}

                  {g.children.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        {g.children.slice(0, 3).map((c) => (
                          <Avatar
                            key={c.id}
                            name={c.name}
                            size="xs"
                            className="ring-2 ring-surface"
                          />
                        ))}
                      </div>
                      <span className="eyebrow text-ink-faint">
                        {g.children.length} child
                        {g.children.length === 1 ? '' : 'ren'}
                      </span>
                    </div>
                  )}
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
                { label: 'Guardian', sortable: true },
                { label: 'Phone', sortable: false },
                { label: 'WhatsApp', sortable: false },
                { label: 'Children', sortable: true },
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
                    {col.sortable && (
                      <ArrowDownUp
                        className="w-3 h-3 opacity-40"
                        strokeWidth={1.75}
                      />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-line-soft">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <p
                    className="font-display text-xl text-ink"
                    style={{ fontVariationSettings: '"opsz" 24' }}
                  >
                    No guardians yet.
                  </p>
                  <p className="mt-1 text-[13px] text-ink-muted">
                    Guardians are added when you onboard a student.
                  </p>
                  <Link
                    href="/students"
                    className="mt-5 inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.25} />
                    Go to students
                  </Link>
                </td>
              </tr>
            )}

            {rows.map((g) => (
              <tr key={g.id} className="hover:bg-surface-2 transition-colors group">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={g.fullName} size="sm" />
                    <div className="min-w-0">
                      <p className="font-semibold text-ink truncate">
                        {g.fullName}
                      </p>
                      <div className="mt-0.5 inline-flex items-center gap-1.5">
                        <Chip
                          tone={relationTone[g.relation] ?? 'neutral'}
                          className="!py-0"
                        >
                          {g.relation}
                        </Chip>
                        {g.isPrimary && (
                          <Chip tone="success" className="!py-0">
                            Primary
                          </Chip>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 font-mono text-[12px] tabular text-ink-soft whitespace-nowrap">
                  {g.phone}
                </td>
                <td className="px-5 py-3 font-mono text-[12px] tabular text-ink-soft whitespace-nowrap">
                  {g.whatsapp ? (
                    <a
                      href={waLink(g.whatsapp) ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-success hover:underline decoration-success/40 underline-offset-[5px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MessageCircle className="w-3 h-3" strokeWidth={2} />
                      {g.whatsapp}
                    </a>
                  ) : (
                    <span className="text-ink-faint">—</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {g.children.length === 0 ? (
                    <span className="text-ink-faint">—</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        {g.children.slice(0, 3).map((c) => (
                          <Avatar
                            key={c.id}
                            name={c.name}
                            size="xs"
                            className="ring-2 ring-surface"
                          />
                        ))}
                      </div>
                      <span className="text-ink-soft tabular text-[12.5px]">
                        {g.children.length}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/parents/${g.id}`}
                    aria-label={`Open ${g.fullName}`}
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

      {/* Pagination stub — parity with Students */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-line-soft text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
        <span>Page 1 of 1</span>
        <div className="flex gap-1">
          <button
            type="button"
            disabled
            className="px-2.5 py-1 rounded border border-line bg-surface-2 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            disabled
            className="px-2.5 py-1 rounded border border-line bg-surface-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
