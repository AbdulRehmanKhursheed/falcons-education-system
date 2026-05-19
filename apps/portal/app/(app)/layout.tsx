import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { requireSession } from '@/lib/auth-helpers';
import type { AppRole } from '@/lib/auth-helpers';
import { signOut } from '@/auth';

async function signOutAction() {
  'use server';
  await signOut({ redirectTo: '/login' });
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  // Parents have their own portal at /parent/*. Middleware already steers
  // them there on every request, but we double-check inside the server
  // component to handle edge cases (e.g. middleware bypassed by tests or
  // future cache layers).
  if (session.user.role === 'PARENT') redirect('/parent/dashboard');
  const role = (session.user.role as AppRole) ?? 'SCHOOL_ADMIN';
  const userName = session.user.name ?? 'User';
  const userEmail = session.user.email ?? '';

  return (
    <AppShell
      role={role}
      userName={userName}
      userEmail={userEmail}
      signOutAction={signOutAction}
    >
      {children}
    </AppShell>
  );
}
