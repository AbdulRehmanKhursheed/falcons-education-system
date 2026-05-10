'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, LogOut } from 'lucide-react';
import { navigation } from '@/lib/nav';
import { cn } from '@/lib/cn';
import { Avatar } from '@/components/ui/Avatar';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-surface border-r border-line">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-line">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-ink text-paper">
            <GraduationCap className="w-4.5 h-4.5" strokeWidth={1.5} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-base text-ink tracking-[-0.02em] group-hover:text-brand transition-colors" style={{ fontVariationSettings: '"opsz" 24' }}>
              Falcons
            </span>
            <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-ink-faint">
              School portal
            </span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6" aria-label="Main navigation">
        {navigation.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-2 flex items-center gap-2 eyebrow text-ink-faint">
              <span className="font-mono normal-case tracking-[0.16em]">{section.number}</span>
              <span aria-hidden className="inline-block h-px w-3 bg-ink-faint/40" />
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map(({ href, label, Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        'nav-item',
                        active && 'nav-item-active'
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2 : 1.75} />
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar name="Admin User" size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-semibold text-ink truncate">Admin User</p>
            <p className="text-[10.5px] text-ink-faint truncate">admin@falconseducationsystem.com</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center w-7 h-7 rounded text-ink-muted hover:bg-surface-3 hover:text-ink transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </aside>
  );
}
