'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Users,
  Receipt,
  ClipboardList,
  ArrowRight,
  Hash,
  X,
} from 'lucide-react';
import { flatNav } from '@/lib/nav';
import { cn } from '@/lib/cn';

type StudentHit = {
  id: string;
  name: string;
  rollNo: string;
  classroom: string;
};
type InvoiceHit = {
  id: string;
  invoiceNo: string;
  total: number;
  studentName: string;
  status: string;
};
type ApplicationHit = {
  id: string;
  applicantName: string;
  stage: string;
  programInterest: string;
};

type SearchResponse = {
  students: StudentHit[];
  invoices: InvoiceHit[];
  applications: ApplicationHit[];
};

type CommandItem = {
  id: string;
  href: string;
  primary: string;
  secondary?: string;
  group: 'students' | 'invoices' | 'applications' | 'actions';
};

type Props = {
  open: boolean;
  onClose: () => void;
};

const groupLabels: Record<CommandItem['group'], string> = {
  students: 'Students',
  invoices: 'Invoices',
  applications: 'Applications',
  actions: 'Quick actions',
};

const groupOrder: Array<CommandItem['group']> = [
  'actions',
  'students',
  'invoices',
  'applications',
];

const groupIcon: Record<CommandItem['group'], typeof Users> = {
  students: Users,
  invoices: Receipt,
  applications: ClipboardList,
  actions: ArrowRight,
};

function formatPKR(n: number): string {
  return `Rs ${n.toLocaleString('en-IN')}`;
}

export function CommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const [rawQuery, setRawQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [results, setResults] = useState<SearchResponse>({
    students: [],
    invoices: [],
    applications: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  // Reset internal state every time the palette opens.
  useEffect(() => {
    if (!open) return;
    setRawQuery('');
    setDebouncedQuery('');
    setActiveIndex(0);
    setResults({ students: [], invoices: [], applications: [] });
    // Focus the input shortly after mount so animation has a chance to play.
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, [open]);

  // Body scroll lock + Esc handling.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  // Debounce search input.
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(rawQuery.trim()), 150);
    return () => window.clearTimeout(t);
  }, [rawQuery]);

  // Reset active index whenever the query changes.
  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery]);

  // Fetch search results when query length >= 2.
  useEffect(() => {
    if (!open) return;
    const q = debouncedQuery;
    if (q.length < 2) {
      setResults({ students: [], invoices: [], applications: [] });
      setIsLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setIsLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: SearchResponse) => {
        setResults({
          students: data.students ?? [],
          invoices: data.invoices ?? [],
          applications: data.applications ?? [],
        });
      })
      .catch((err) => {
        if ((err as { name?: string }).name === 'AbortError') return;
        setResults({ students: [], invoices: [], applications: [] });
      })
      .finally(() => setIsLoading(false));
    return () => ctrl.abort();
  }, [debouncedQuery, open]);

  // Build the unified item list (in the order they're rendered).
  const items = useMemo<CommandItem[]>(() => {
    const q = debouncedQuery.toLowerCase();
    const nav = flatNav();
    const navHits: CommandItem[] = nav
      .filter((n) => {
        if (q.length < 2) return true;
        return (
          n.label.toLowerCase().includes(q) ||
          n.href.toLowerCase().includes(q)
        );
      })
      .slice(0, 5)
      .map((n) => ({
        id: `nav-${n.href}`,
        href: n.href,
        primary: n.label,
        secondary: n.href,
        group: 'actions',
      }));

    if (q.length < 2) {
      return navHits;
    }

    const studentItems: CommandItem[] = results.students.map((s) => ({
      id: `student-${s.id}`,
      href: `/students/${s.id}`,
      primary: s.name,
      secondary: `${s.rollNo} · ${s.classroom}`,
      group: 'students',
    }));
    const invoiceItems: CommandItem[] = results.invoices.map((i) => ({
      id: `invoice-${i.id}`,
      href: `/fees/${i.id}`,
      primary: i.invoiceNo,
      secondary: `${i.studentName} · ${formatPKR(i.total)}`,
      group: 'invoices',
    }));
    const applicationItems: CommandItem[] = results.applications.map((a) => ({
      id: `application-${a.id}`,
      href: `/admissions/${a.id}`,
      primary: a.applicantName,
      secondary: `${a.programInterest} · ${a.stage.toLowerCase()}`,
      group: 'applications',
    }));

    return [...navHits, ...studentItems, ...invoiceItems, ...applicationItems];
  }, [debouncedQuery, results]);

  // Group items in render order.
  const grouped = useMemo(() => {
    const map = new Map<CommandItem['group'], CommandItem[]>();
    for (const it of items) {
      const arr = map.get(it.group) ?? [];
      arr.push(it);
      map.set(it.group, arr);
    }
    return groupOrder
      .map((g) => ({ group: g, items: map.get(g) ?? [] }))
      .filter((entry) => entry.items.length > 0);
  }, [items]);

  // Build the index-aligned flat list matching render order, so arrow keys
  // walk through items as visually presented.
  const flatItems = useMemo(
    () => grouped.flatMap((g) => g.items),
    [grouped],
  );

  const selectItem = useCallback(
    (item: CommandItem | undefined) => {
      if (!item) return;
      onClose();
      router.push(item.href);
    },
    [onClose, router],
  );

  // Keyboard nav inside the palette.
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (flatItems.length ? (i + 1) % flatItems.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) =>
        flatItems.length ? (i - 1 + flatItems.length) % flatItems.length : 0,
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      selectItem(flatItems[activeIndex]);
    }
  }

  // Scroll the active item into view.
  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  if (!open) return null;

  const hasQuery = debouncedQuery.length >= 2;
  const hasResults = flatItems.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh] sm:pt-[18vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close command palette"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-[fadeIn_120ms_ease-out]"
      />

      <div
        className="relative w-full max-w-[600px] rounded-xl border border-line bg-surface shadow-2xl overflow-hidden animate-[paletteIn_140ms_ease-out]"
        onKeyDown={onKeyDown}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-line-soft">
          <Search className="w-4 h-4 text-ink-faint shrink-0" strokeWidth={1.75} />
          <input
            ref={inputRef}
            type="text"
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder="Search students, invoices, applications…"
            className="flex-1 bg-transparent text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
            aria-label="Search"
            autoComplete="off"
            spellCheck={false}
          />
          {isLoading && hasQuery && (
            <span className="text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
              Searching…
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex items-center justify-center w-7 h-7 rounded-md text-ink-faint hover:bg-surface-3 hover:text-ink-soft transition-colors"
          >
            <X className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto"
        >
          {!hasResults && (
            <div className="px-5 py-12 text-center">
              <p
                className="font-display text-lg text-ink"
                style={{ fontVariationSettings: '"opsz" 24' }}
              >
                {hasQuery ? 'Nothing matches.' : 'Cmd-K to search.'}
              </p>
              <p className="mt-1.5 text-[12.5px] text-ink-muted">
                {hasQuery
                  ? 'Try a different spelling or a roll number.'
                  : 'Start typing to search students, invoices, applications…'}
              </p>
            </div>
          )}

          {grouped.map((section) => {
            const Icon = groupIcon[section.group];
            return (
              <section
                key={section.group}
                className="border-t border-line-soft first:border-t-0"
              >
                <header className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                  <Icon
                    className="w-3 h-3 text-ink-faint"
                    strokeWidth={1.75}
                  />
                  <span className="eyebrow">
                    {groupLabels[section.group]}
                  </span>
                </header>
                <ul className="pb-2">
                  {section.items.map((item) => {
                    const flatIndex = flatItems.indexOf(item);
                    const active = flatIndex === activeIndex;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          data-active={active ? 'true' : undefined}
                          onMouseEnter={() => setActiveIndex(flatIndex)}
                          onClick={() => selectItem(item)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2 text-left transition-colors',
                            active
                              ? 'bg-surface-3'
                              : 'hover:bg-surface-2',
                          )}
                        >
                          <span
                            className={cn(
                              'inline-flex items-center justify-center w-6 h-6 rounded-md border shrink-0',
                              active
                                ? 'border-line-strong bg-surface text-ink'
                                : 'border-line bg-surface-2 text-ink-faint',
                            )}
                          >
                            <Hash className="w-3 h-3" strokeWidth={1.75} />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                'truncate text-[13px]',
                                active
                                  ? 'text-ink font-semibold'
                                  : 'text-ink-soft font-medium',
                              )}
                            >
                              {item.primary}
                            </p>
                            {item.secondary && (
                              <p className="truncate text-[11.5px] text-ink-faint mt-0.5">
                                {item.secondary}
                              </p>
                            )}
                          </div>
                          <ArrowRight
                            className={cn(
                              'w-3.5 h-3.5 shrink-0 transition-opacity',
                              active ? 'text-ink-soft opacity-100' : 'opacity-0',
                            )}
                            strokeWidth={2}
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        {/* Footer keybind hint */}
        <footer className="flex items-center gap-4 px-4 py-2 border-t border-line-soft bg-surface-2 text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
          <span>
            <kbd className="font-mono not-italic">{'↑↓'}</kbd> navigate
          </span>
          <span>
            <kbd className="font-mono not-italic">{'↵'}</kbd> open
          </span>
          <span>
            <kbd className="font-mono not-italic">esc</kbd> close
          </span>
        </footer>
      </div>

      {/* Local CSS keyframes — keeps us off framer-motion for this one. */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes paletteIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
