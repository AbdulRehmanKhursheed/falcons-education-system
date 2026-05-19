'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ChevronRight, LogOut, User, Menu } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/cn';

type Crumb = { label: string; href: string };

type Props = {
  userName: string;
  userEmail: string;
  unreadCount: number;
  childrenLinks: Array<{ id: string; fullName: string }>;
  signOutAction: () => Promise<void>;
};

/**
 * Top bar for the parent portal. Lighter than the admin TopBar — no command
 * palette, no search field, no role chip. Breadcrumbs are derived from the
 * known parent routes.
 */
export function ParentTopBar({
  userName,
  userEmail,
  unreadCount,
  childrenLinks,
  signOutAction,
}: Props) {
  const pathname = usePathname();
  const crumbs = useBreadcrumbs(pathname, childrenLinks);
  const [open, setOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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

  useEffect(() => {
    setOpen(false);
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-30 bg-surface/85 backdrop-blur-md border-b border-line">
        <div className="flex items-center gap-3 lg:gap-6 h-14 px-3 sm:px-5 lg:px-7">
          {/* Mobile hamburger — opens an inline drawer with parent links */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-md text-ink-soft hover:bg-surface-3 transition-colors -ml-1"
            aria-label="Open navigation"
          >
            <Menu className="w-4 h-4" strokeWidth={1.75} />
          </button>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[12px] text-ink-muted min-w-0" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <span key={`${c.href}-${i}`} className="flex items-center gap-1.5 min-w-0">
                {i > 0 && <ChevronRight className="w-3 h-3 text-ink-faint shrink-0" strokeWidth={1.5} />}
                <Link
                  href={c.href}
                  className={cn(
                    'truncate transition-colors',
                    i === crumbs.length - 1
                      ? 'text-ink font-semibold'
                      : 'hover:text-ink',
                  )}
                >
                  {c.label}
                </Link>
              </span>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/parent/dashboard#notifications"
              className="relative inline-flex items-center justify-center w-9 h-9 rounded-md text-ink-soft hover:bg-surface-3 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" strokeWidth={1.75} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-1 rounded-full bg-accent text-paper text-[9px] font-bold inline-flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>

            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                className={cn(
                  'inline-flex items-center gap-2 pl-1 pr-2 py-1 rounded-md border border-transparent hover:bg-surface-3 transition-colors',
                  open && 'bg-surface-3 border-line',
                )}
              >
                <Avatar name={userName} size="sm" />
                <span className="hidden md:flex items-center gap-1.5 min-w-0">
                  <span className="text-[12.5px] font-semibold text-ink truncate max-w-[140px]">{userName}</span>
                  <Chip tone="accent" className="!px-1.5 !py-0 !text-[9.5px]">
                    Parent
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
                      <Chip tone="accent" className="!px-1.5 !py-0 !text-[9.5px]">
                        Parent
                      </Chip>
                    </div>
                  </div>

                  <div className="py-1">
                    <span
                      role="menuitem"
                      aria-disabled
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] text-ink-faint cursor-not-allowed"
                    >
                      <User className="w-3.5 h-3.5" strokeWidth={1.75} />
                      Profile
                    </span>
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

      {/* Mobile drawer — appears below the topbar on <lg screens */}
      {mobileNavOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-ink/40"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-72 bg-surface border-r border-line p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="eyebrow text-ink-faint mb-3">Quick links</p>
            <ul className="space-y-1 mb-5">
              <li>
                <Link
                  href="/parent/dashboard"
                  className="block px-3 py-2 rounded-md text-[13px] text-ink-soft hover:bg-surface-3 hover:text-ink"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/parent/announcements"
                  className="block px-3 py-2 rounded-md text-[13px] text-ink-soft hover:bg-surface-3 hover:text-ink"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Announcements
                </Link>
              </li>
            </ul>
            {childrenLinks.length > 0 && (
              <>
                <p className="eyebrow text-ink-faint mb-3">
                  {childrenLinks.length > 1 ? 'Your children' : 'Your child'}
                </p>
                <ul className="space-y-1">
                  {childrenLinks.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/parent/kids/${c.id}`}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] text-ink-soft hover:bg-surface-3 hover:text-ink"
                        onClick={() => setMobileNavOpen(false)}
                      >
                        <Avatar name={c.fullName} size="xs" />
                        <span className="truncate">{c.fullName}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <form action={signOutAction} className="mt-6 pt-4 border-t border-line-soft">
              <button
                type="submit"
                className="inline-flex items-center gap-2.5 px-3 py-2 text-[12.5px] text-ink-soft hover:bg-surface-2 hover:text-ink"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function useBreadcrumbs(
  pathname: string,
  childrenLinks: Array<{ id: string; fullName: string }>,
): Crumb[] {
  const crumbs: Crumb[] = [{ label: 'Parent portal', href: '/parent/dashboard' }];

  if (pathname.startsWith('/parent/announcements')) {
    crumbs.push({ label: 'Announcements', href: '/parent/announcements' });
    return crumbs;
  }

  if (pathname.startsWith('/parent/kids/')) {
    const segments = pathname.split('/').filter(Boolean);
    const kidId = segments[2];
    const child = childrenLinks.find((c) => c.id === kidId);
    if (child) {
      crumbs.push({ label: child.fullName, href: `/parent/kids/${child.id}` });
    } else {
      crumbs.push({ label: 'Child', href: `/parent/kids/${kidId}` });
    }
    const subPage = segments[3];
    const sectionLabel: Record<string, string> = {
      attendance: 'Attendance',
      fees: 'Fees',
      grades: 'Grades',
      homework: 'Homework',
      timetable: 'Timetable',
    };
    if (subPage && sectionLabel[subPage]) {
      crumbs.push({ label: sectionLabel[subPage], href: pathname });
    }
    return crumbs;
  }

  return crumbs;
}
