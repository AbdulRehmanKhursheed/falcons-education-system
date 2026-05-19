import { requireRole } from '@/lib/auth-helpers';
import { signOut } from '@/auth';
import { ParentSidebar } from '@/components/layout/ParentSidebar';
import { ParentTopBar } from '@/components/layout/ParentTopBar';
import { ToastProvider } from '@/components/ui/Toast';
import {
  getParentChildren,
  getUnreadNotificationCount,
} from '@/lib/queries/parent';

async function signOutAction() {
  'use server';
  await signOut({ redirectTo: '/login' });
}

/**
 * Parent portal shell. Server Component — fetches the session, the
 * children list, and the unread-notification count once, then hands those
 * down to the (client) Sidebar + TopBar so they don't re-fetch.
 *
 * Calling `requireRole(['PARENT'])` guarantees non-PARENT roles never see
 * any /parent/* surface.
 */
export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(['PARENT']);
  const userId = session.user.id;
  const userName = session.user.name ?? 'Parent';
  const userEmail = session.user.email ?? '';

  const [kids, unread] = await Promise.all([
    getParentChildren(userId),
    getUnreadNotificationCount(userId),
  ]);

  const childrenLinks = kids.map((c) => ({
    id: c.id,
    fullName: c.fullName,
    classroomName: c.classroomName,
  }));

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-surface-2">
        <ParentSidebar
          userName={userName}
          userEmail={userEmail}
          kids={childrenLinks}
          signOutAction={signOutAction}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <ParentTopBar
            userName={userName}
            userEmail={userEmail}
            unreadCount={unread}
            childrenLinks={childrenLinks.map((c) => ({ id: c.id, fullName: c.fullName }))}
            signOutAction={signOutAction}
          />
          <main className="flex-1 px-5 sm:px-7 lg:px-10 py-8 lg:py-10">
            <div className="max-w-6xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
