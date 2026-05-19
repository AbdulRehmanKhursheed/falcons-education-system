'use client';

import { useCallback, useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { TopBar } from './TopBar';
import { CommandPalette } from './CommandPalette';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { ToastProvider } from '@/components/ui/Toast';
import type { AppRole } from '@/lib/auth-helpers';
import type { NotificationRow } from '@/lib/queries/notifications';

type Props = {
  role: AppRole;
  userName: string;
  userEmail: string;
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
  notificationsUnread: number;
  notificationsRecent: NotificationRow[];
};

/**
 * Client shell — owns the mobile-nav open/close state, the Cmd-K command
 * palette, and the global keyboard-shortcut handler. Receives the
 * pre-fetched notification data from the server-side AppShell wrapper.
 */
export function AppShellInner({
  role,
  userName,
  userEmail,
  signOutAction,
  children,
  notificationsUnread,
  notificationsRecent,
}: Props) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-surface-2">
        <Sidebar
          role={role}
          userName={userName}
          userEmail={userEmail}
          signOutAction={signOutAction}
        />
        <MobileNav
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          role={role}
          userName={userName}
          userEmail={userEmail}
          signOutAction={signOutAction}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar
            userName={userName}
            userEmail={userEmail}
            userRole={role}
            signOutAction={signOutAction}
            onOpenMobileNav={() => setMobileNavOpen(true)}
            onOpenPalette={openPalette}
            notificationsUnread={notificationsUnread}
            notificationsRecent={notificationsRecent}
          />
          <main className="flex-1 px-5 sm:px-7 lg:px-10 py-8 lg:py-10">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>

        <CommandPalette open={paletteOpen} onClose={closePalette} userRole={role} />
        <KeyboardShortcuts
          onOpenPalette={openPalette}
          paletteOpen={paletteOpen}
        />
      </div>
    </ToastProvider>
  );
}
