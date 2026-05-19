import { auth } from '@/auth';
import {
  getRecentNotifications,
  getUnreadCount,
} from '@/lib/queries/notifications';
import { AppShellInner } from './AppShellInner';
import type { AppRole } from '@/lib/auth-helpers';

type Props = {
  role: AppRole;
  userName: string;
  userEmail: string;
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
};

/**
 * Server wrapper for the portal chrome. Resolves notification state for the
 * signed-in user on every render (the cost is two cheap indexed queries) so
 * the TopBar bell shows a fresh unread count + recent rows on every nav.
 *
 * Interactive UI (mobile nav, command palette, keyboard shortcuts) lives in
 * the inner client shell; this server layer exists solely to fetch data and
 * pass plain objects across the RSC boundary.
 */
export async function AppShell(props: Props) {
  const session = await auth();
  const userId = session?.user?.id;

  const [unread, recent] = userId
    ? await Promise.all([
        getUnreadCount(userId),
        getRecentNotifications(userId, 5),
      ])
    : [0, []];

  return (
    <AppShellInner
      {...props}
      notificationsUnread={unread}
      notificationsRecent={recent}
    />
  );
}
