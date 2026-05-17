'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, Bell, Command, ChevronRight, LogOut, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { flatNav } from '@/lib/nav';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/cn';
import type { AppRole } from '@/lib/auth-helpers';

function useBreadcrumbs(pathname: string) {
  const item = flatNav().find((i) => i.href === pathname || pathname.startsWith(`${i.href}/`));
  if (!item) return [{ label: 'Portal', href: '/dashboard' }];
  return [
    { label: 'Portal', href: '/dashboard' },
    { label: item.label, href: item.href },
  ];
}

const roleTone: Record<AppRole, Parameters<typeof Chip>[0]['tone']> = {
  SUPER_ADMIN:  'danger',
  SCHOOL_ADMIN: 'brand',
  TEACHER:      'info',
  PARENT:       'neutral',
  ACCOUNTANT:   'warn',
};

const roleLabel: Record<AppRole, string> = {
  SUPER_ADMIN:  'Super Admin',
  SCHOOL_ADMIN: 'School Admin',
  TEACHER:      'Teacher',
  PARENT:       'Parent',
  ACCOUNTANT:   'Accountant',
};

type Props = {
  userName: string;
  userEmail: string;
  userRole: AppRole;
  signOutAction: () => Promise<void>;
};

export function TopBar({ userName, userEmail, userRole, signOutAction }: Props) {
  const pathname = usePathname();
  const crumbs = useBreadcrumbs(pathname);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SCHOOL_ADMIN';

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

        {/* Right cluster */}
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

          {/* User menu */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
              className={cn(
                'inline-flex items-center gap-2 pl-1 pr-2 py-1 rounded-md border border-transparent hover:bg-surface-3 transition-colors',
                open && 'bg-surface-3 border-line'
              )}
            >
              <Avatar name={userName} size="sm" />
              <span className="hidden md:flex items-center gap-1.5 min-w-0">
                <span className="text-[12.5px] font-semibold text-ink truncate max-w-[120px]">{userName}</span>
                <Chip tone={roleTone[userRole]} className="!px-1.5 !py-0 !text-[9.5px]">
                  {roleLabel[userRole]}
                </Chip>
              </span>
            </button>

            {open && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-1.5 w-60 rounded-lg border border-line bg-surface shadow-lg overflow-hidden z-40"
              >
                <div className="px-3.5 py-3 border-b border-line-soft">
                  <p className="text-[12.5px] font-semibold text-ink truncate">{userName}</p>
                  <p className="text-[11px] text-ink-faint truncate mt-0.5">{userEmail}</p>
                  <div className="mt-2">
                    <Chip tone={roleTone[userRole]} className="!px-1.5 !py-0 !text-[9.5px]">
                      {roleLabel[userRole]}
                    </Chip>
                  </div>
                </div>

                <div className="py-1">
                  {isAdmin ? (
                    <Link
                      href="/settings/users"
                      role="menuitem"
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] text-ink-soft hover:bg-surface-2 hover:text-ink transition-colors"
                    >
                      <User className="w-3.5 h-3.5" strokeWidth={1.75} />
                      Profile &amp; users
                    </Link>
                  ) : (
                    <span
                      role="menuitem"
                      aria-disabled
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] text-ink-faint cursor-not-allowed"
                    >
                      <User className="w-3.5 h-3.5" strokeWidth={1.75} />
                      Profile
                    </span>
                  )}

                  <form action={signOutAction} className="border-t border-line-soft mt-1 pt-1">
                    <button
                      type="submit"
                      role="menuitem"
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] text-ink-soft hover:bg-surface-2 hover:text-ink transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
                      Sign out
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
