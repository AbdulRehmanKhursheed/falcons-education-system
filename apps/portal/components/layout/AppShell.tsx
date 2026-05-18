'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { TopBar } from './TopBar';
import type { AppRole } from '@/lib/auth-helpers';

type Props = {
  role: AppRole;
  userName: string;
  userEmail: string;
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
};

/**
 * Client wrapper that owns the mobile-nav open/close state.
 *
 * Kept as small as possible so the parent route layout can stay a Server
 * Component and continue fetching the session server-side.
 */
export function AppShell({
  role,
  userName,
  userEmail,
  signOutAction,
  children,
}: Props) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
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
        />
        <main className="flex-1 px-5 sm:px-7 lg:px-10 py-8 lg:py-10">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
