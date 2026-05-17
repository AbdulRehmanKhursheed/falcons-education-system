import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { requireSession } from '@/lib/auth-helpers';
import type { AppRole } from '@/lib/auth-helpers';
import { signOut } from '@/auth';

async function signOutAction() {
  'use server';
  await signOut({ redirectTo: '/login' });
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const role = (session.user.role as AppRole) ?? 'SCHOOL_ADMIN';
  const userName = session.user.name ?? 'User';
  const userEmail = session.user.email ?? '';

  return (
    <div className="flex min-h-screen bg-surface-2">
      <Sidebar
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
        />
        <main className="flex-1 px-5 sm:px-7 lg:px-10 py-8 lg:py-10">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
