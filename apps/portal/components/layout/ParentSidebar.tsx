'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Heart } from 'lucide-react';
import { parentNavigation } from '@/lib/nav';
import { cn } from '@/lib/cn';
import { Avatar } from '@/components/ui/Avatar';

type ChildLink = {
  id: string;
  fullName: string;
  classroomName: string | null;
};

type Props = {
  userName: string;
  userEmail: string;
  kids: ChildLink[];
  signOutAction: () => Promise<void>;
};

/**
 * Parent portal sidebar. Mirrors the admin Sidebar shape (sticky aside, brand
 * + nav + user footer) but with a calmer, more welcoming tone.
 *
 * The two static items (Dashboard, Announcements) come from `parentNavigation`.
 * Per-child entries are rendered between them — driven by a server query
 * passed in as props so the dropdown stays in sync with reality.
 */
export function ParentSidebar({ userName, userEmail, kids, signOutAction }: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-ink border-r border-ink/40 text-paper">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-paper/10">
        <Link href="/parent/dashboard" className="flex items-center gap-2.5 group">
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
              Parent portal
            </span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6" aria-label="Parent navigation">
        {/* Top static section: Dashboard */}
        {parentNavigation.slice(0, 1).map((section) => (
          <NavSectionBlock
            key={section.label}
            label={section.label}
            number={section.number}
            items={section.items}
            pathname={pathname}
          />
        ))}

        {/* Children */}
        {kids.length > 0 && (
          <div>
            <p className="px-3 mb-2 flex items-center gap-2 eyebrow text-paper/40">
              <span className="font-mono normal-case tracking-[0.16em]">02</span>
              <span aria-hidden className="inline-block h-px w-3 bg-paper/20" />
              {kids.length > 1 ? 'Your children' : 'Your child'}
            </p>
            <ul className="space-y-0.5">
              {kids.map((child) => {
                const base = `/parent/kids/${child.id}`;
                const active = pathname === base || pathname.startsWith(`${base}/`);
                return (
                  <li key={child.id}>
                    <Link
                      href={base}
                      className={cn(
                        'group relative flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors',
                        active
                          ? 'bg-paper/10 text-paper before:content-[""] before:absolute before:-left-2 before:top-2 before:bottom-2 before:w-[3px] before:rounded-sm before:bg-accent'
                          : 'text-paper/70 hover:bg-paper/5 hover:text-paper',
                      )}
                    >
                      <Avatar name={child.fullName} size="xs" className="!bg-paper/15 !text-paper" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12.5px] font-semibold truncate">
                          {child.fullName}
                        </span>
                        <span
                          className={cn(
                            'block text-[10.5px] truncate',
                            active ? 'text-paper/70' : 'text-paper/50',
                          )}
                        >
                          {child.classroomName ?? 'No classroom'}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Announcements (bottom of nav) */}
        {parentNavigation.slice(1).map((section) => (
          <NavSectionBlock
            key={section.label}
            label={section.label}
            number={kids.length > 0 ? '03' : '02'}
            items={section.items}
            pathname={pathname}
          />
        ))}

        {/* School love note */}
        <div className="mx-2 mt-6 rounded-md border border-paper/10 bg-paper/5 px-3 py-3">
          <p className="eyebrow text-accent inline-flex items-center gap-1.5 mb-1.5">
            <Heart className="w-3 h-3" strokeWidth={1.75} />
            We&rsquo;re here for you
          </p>
          <p className="text-[11.5px] text-paper/60 leading-snug">
            Questions about fees, attendance, or homework? Reach out any time on
            WhatsApp.
          </p>
        </div>
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
    </aside>
  );
}

function NavSectionBlock({
  label,
  number,
  items,
  pathname,
}: {
  label: string;
  number: string;
  items: { href: string; label: string; Icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[];
  pathname: string;
}) {
  return (
    <div>
      <p className="px-3 mb-2 flex items-center gap-2 eyebrow text-ink-faint">
        <span className="font-mono normal-case tracking-[0.16em]">{number}</span>
        <span aria-hidden className="inline-block h-px w-3 bg-ink-faint/40" />
        {label}
      </p>
      <ul className="space-y-0.5">
        {items.map(({ href, label: itemLabel, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn('nav-item', active && 'nav-item-active')}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2 : 1.75} />
                <span>{itemLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
