import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { requireRole } from '@/lib/auth-helpers';
import { getUsers } from '@/lib/queries/settings';
import { UsersManager } from './UsersManager';

export const metadata = { title: 'Users · Settings' };

export default async function UsersPage() {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);
  const users = await getUsers();
  const canMutate = session.user.role === 'SUPER_ADMIN';

  return (
    <>
      <PageHeader
        eyebrow="Settings · 04 / Users"
        title="User management"
        description="Staff and parent accounts with portal access. Role changes, deactivation and password resets are gated to Super Admin."
        actions={
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            All settings
          </Link>
        }
      />

      <UsersManager
        rows={users}
        currentUserId={session.user.id}
        canMutate={canMutate}
      />
    </>
  );
}
