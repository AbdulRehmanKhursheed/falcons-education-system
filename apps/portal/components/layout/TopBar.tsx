'use client';

import { Search, Bell, Command, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { flatNav } from '@/lib/nav';
import { Avatar } from '@/components/ui/Avatar';

function useBreadcrumbs(pathname: string) {
  const item = flatNav().find((i) => i.href === pathname || pathname.startsWith(`${i.href}/`));
  if (!item) return [{ label: 'Portal', href: '/dashboard' }];
  return [
    { label: 'Portal', href: '/dashboard' },
    { label: item.label, href: item.href },
  ];
}

export function TopBar() {
  const pathname = usePathname();
  const crumbs = useBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-30 bg-surface/85 backdrop-blur-md border-b border-line">
      <div className="flex items-center gap-6 h-14 px-5 lg:px-7">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[12px] text-ink-muted" aria-label="Breadcrumb">
          {crumbs.map((c, i) => (
            <span key={c.href} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="w-3 h-3 text-ink-faint" strokeWidth={1.5} />}
              <span className={i === crumbs.length - 1 ? 'text-ink font-semibold' : 'hover:text-ink transition-colors'}>
                {c.label}
              </span>
            </span>
          ))}
        </nav>

        {/* Search */}
        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            className="hidden md:inline-flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-md border border-line bg-surface-2 text-ink-faint hover:bg-surface-3 hover:text-ink-muted transition-colors text-[12.5px] w-72"
          >
            <Search className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span className="flex-1 text-left">Search students, invoices, applicants…</span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-line text-ink-faint">
              <Command className="w-2.5 h-2.5" strokeWidth={2} />K
            </span>
          </button>

          <button
            type="button"
            className="relative inline-flex items-center justify-center w-9 h-9 rounded-md text-ink-soft hover:bg-surface-3 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" strokeWidth={1.75} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent" aria-hidden />
          </button>

          <div className="lg:hidden">
            <Avatar name="Admin User" size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
}
