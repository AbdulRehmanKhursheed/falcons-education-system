'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { navigation } from '@/lib/nav';
import { cn } from '@/lib/cn';
import { Avatar } from '@/components/ui/Avatar';
import type { AppRole } from '@/lib/auth-helpers';

type Props = {
  role: AppRole;
  userName: string;
  userEmail: string;
  signOutAction: () => Promise<void>;
};

/**
 * Desktop sticky sidebar. Hidden on screens narrower than lg — the
 * MobileNav drawer renders the same content via SidebarContent.
 */
export function Sidebar({ role, userName, userEmail, signOutAction }: Props) {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-ink border-r border-ink/40 text-paper">
      <SidebarContent
        role={role}
        userName={userName}
        userEmail={userEmail}
        signOutAction={signOutAction}
      />
    </aside>
  );
}

/**
 * Inner content of the sidebar — Brand + Nav + User footer.
 * Rendered both inside the desktop <aside> and inside the mobile drawer.
 *
 * `onNavigate` lets the mobile drawer close itself when a nav link is tapped.
 */
export function SidebarContent({
  role,
  userName,
  userEmail,
  signOutAction,
  onNavigate,
}: Props & { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Brand */}
      <div className="px-5 py-5 border-b border-paper/10">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5 group"
        >
          <Image
            src="/logo.png"
            alt="Falcons Education System crest"
            width={48}
            height={42}
            priority
            className="h-10 w-auto shrink-0"
          />
          <span className="flex flex-col leading-tight min-w-0">
            <span
              className="font-display text-[13.5px] text-paper tracking-[-0.01em] group-hover:text-accent-soft transition-colors"
              style={{ fontVariationSettings: '"opsz" 20' }}
            >
              Falcons Education System
            </span>
            <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-accent">
              Staff portal
            </span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6" aria-label="Main navigation">
        {navigation.map((section) => {
          const visible = section.items.filter(
            (item) => !item.roles || item.roles.includes(role),
          );
          if (visible.length === 0) return null;
          return (
            <div key={section.label}>
              <p className="px-3 mb-2 flex items-center gap-2 eyebrow text-paper/40">
                <span className="font-mono normal-case tracking-[0.16em]">{section.number}</span>
                <span aria-hidden className="inline-block h-px w-3 bg-paper/20" />
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {visible.map(({ href, label, Icon }) => {
                  const active = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={onNavigate}
                        className={cn('nav-item', active && 'nav-item-active')}
                      >
                        <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2 : 1.75} />
                        <span>{label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-paper/10 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar name={userName} size="sm" className="!bg-paper/10 !text-paper" />
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-semibold text-paper truncate">{userName}</p>
            <p className="text-[10.5px] text-paper/50 truncate">{userEmail}</p>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex items-center justify-center w-7 h-7 rounded text-paper/60 hover:bg-paper/10 hover:text-paper transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
