'use client';

import { useMemo, useState, useTransition } from 'react';
import { Search, KeyRound, Power, Shield, X } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { formatDate } from '@/lib/format';
import type { UserRow } from '@/lib/queries/settings';
import {
  resetUserPassword,
  toggleUserActive,
  updateUserRole,
} from '@/app/(app)/settings/users/_actions';

type Role = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'PARENT' | 'ACCOUNTANT';

const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: 'Super admin',
  SCHOOL_ADMIN: 'School admin',
  TEACHER: 'Teacher',
  PARENT: 'Parent',
  ACCOUNTANT: 'Accountant',
};

const ROLE_TONE: Record<Role, Parameters<typeof Chip>[0]['tone']> = {
  SUPER_ADMIN: 'danger',
  SCHOOL_ADMIN: 'brand',
  TEACHER: 'info',
  PARENT: 'neutral',
  ACCOUNTANT: 'warn',
};

const ROLE_FILTERS: Array<{ value: Role | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All roles' },
  { value: 'SUPER_ADMIN', label: 'Super admin' },
  { value: 'SCHOOL_ADMIN', label: 'School admin' },
  { value: 'TEACHER', label: 'Teacher' },
  { value: 'ACCOUNTANT', label: 'Accountant' },
  { value: 'PARENT', label: 'Parent' },
];

type Props = {
  rows: UserRow[];
  currentUserId: string;
  canMutate: boolean;
};

export function UsersManager({ rows, currentUserId, canMutate }: Props) {
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [activeOnly, setActiveOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [resetTarget, setResetTarget] = useState<UserRow | null>(null);

  const filtered = useMemo(() => {
    return rows.filter((u) => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      if (activeOnly && !u.active) return false;
      const q = query.trim().toLowerCase();
      if (q) {
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [rows, roleFilter, activeOnly, query]);

  function handleRoleChange(userId: string, role: Role) {
    if (!canMutate) return;
    setError(null);
    setBusyId(userId);
    startTransition(async () => {
      const result = await updateUserRole({ userId, role });
      if (!result.ok) setError(result.error);
      setBusyId(null);
    });
  }

  function handleToggleActive(userId: string, currentlyActive: boolean) {
    if (!canMutate) return;
    setError(null);
    const verb = currentlyActive ? 'Deactivate' : 'Reactivate';
    if (!confirm(`${verb} this user?`)) return;
    setBusyId(userId);
    startTransition(async () => {
      const result = await toggleUserActive(userId);
      if (!result.ok) setError(result.error);
      setBusyId(null);
    });
  }

  return (
    <>
      <div className="bg-surface border border-line rounded-lg">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-line-soft">
          <div className="flex flex-wrap items-center gap-1.5">
            {ROLE_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setRoleFilter(f.value)}
                className={
                  roleFilter === f.value
                    ? 'inline-flex items-center rounded-md bg-ink px-2.5 py-1.5 text-[11.5px] font-semibold text-paper transition-colors'
                    : 'inline-flex items-center rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors'
                }
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-[12px] text-ink-soft cursor-pointer">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={(e) => setActiveOnly(e.target.checked)}
                className="accent-brand"
              />
              Active only
            </label>
            <div className="relative">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint"
                strokeWidth={1.75}
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, phone"
                className="rounded-md border border-line bg-surface pl-8 pr-3 py-1.5 text-[12.5px] text-ink w-64 focus:outline-none focus:border-brand"
              />
            </div>
          </div>
        </div>

        {!canMutate && (
          <div className="px-5 py-2.5 border-b border-line-soft bg-info-soft/40 text-[12px] text-info inline-flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" strokeWidth={1.75} />
            Read-only view — only Super Admin can change roles, reset passwords or deactivate users.
          </div>
        )}

        {error && (
          <div className="px-5 py-3 border-b border-line-soft bg-danger-soft/50 text-[12.5px] text-danger">
            {error}
          </div>
        )}

        {/* Mobile cards — shown < md */}
        <div className="md:hidden divide-y divide-line-soft">
          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p
                className="font-display text-xl text-ink"
                style={{ fontVariationSettings: '"opsz" 24' }}
              >
                No users match.
              </p>
              <p className="mt-1 text-[13px] text-ink-muted">
                Try a different role or search term.
              </p>
            </div>
          ) : (
            filtered.map((u) => {
              const isSelf = u.id === currentUserId;
              const busy = busyId === u.id && isPending;
              return (
                <div key={u.id} className="px-4 py-3.5">
                  <div className="flex items-start gap-3">
                    <Avatar name={u.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-ink text-[14px] truncate inline-flex items-center gap-2">
                            {u.name}
                            {isSelf && (
                              <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-[12px] text-ink-muted truncate mt-0.5">
                            {u.email}
                          </p>
                        </div>
                        {u.active ? (
                          <Chip tone="success" className="shrink-0">Active</Chip>
                        ) : (
                          <Chip tone="neutral" className="shrink-0">Inactive</Chip>
                        )}
                      </div>

                      <div className="mt-2">
                        {canMutate && !isSelf ? (
                          <select
                            value={u.role}
                            disabled={busy}
                            onChange={(e) =>
                              handleRoleChange(u.id, e.target.value as Role)
                            }
                            className="w-full rounded-md border border-line bg-surface px-2 py-1.5 text-[12px] text-ink focus:outline-none focus:border-brand disabled:opacity-60"
                          >
                            {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                              <option key={r} value={r}>
                                {ROLE_LABEL[r]}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Chip tone={ROLE_TONE[u.role as Role]}>
                            {ROLE_LABEL[u.role as Role]}
                          </Chip>
                        )}
                      </div>

                      <p className="mt-2 text-[11px] eyebrow text-ink-faint">
                        Updated{' '}
                        <span className="tabular text-ink-soft normal-case tracking-normal ml-1">
                          {formatDate(u.updatedAt)}
                        </span>
                      </p>

                      {canMutate && (
                        <div className="mt-3 flex flex-wrap items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setResetTarget(u)}
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors disabled:opacity-60"
                          >
                            <KeyRound className="w-3.5 h-3.5" strokeWidth={1.75} />
                            Reset
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(u.id, u.active)}
                            disabled={busy || isSelf}
                            title={
                              isSelf
                                ? 'You can’t deactivate yourself'
                                : u.active
                                  ? 'Deactivate'
                                  : 'Reactivate'
                            }
                            className={
                              u.active
                                ? 'inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-soft hover:bg-danger-soft hover:text-danger hover:border-danger/40 transition-colors disabled:opacity-40 disabled:hover:bg-surface disabled:hover:text-ink-soft disabled:hover:border-line'
                                : 'inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-soft hover:bg-success-soft hover:text-success hover:border-success/40 transition-colors disabled:opacity-40 disabled:hover:bg-surface disabled:hover:text-ink-soft disabled:hover:border-line'
                            }
                          >
                            <Power className="w-3.5 h-3.5" strokeWidth={1.75} />
                            {u.active ? 'Deactivate' : 'Reactivate'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop table — md+ */}
        <table className="hidden md:table w-full text-[13px]">
          <thead className="bg-surface-3/60">
            <tr className="text-left text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Updated</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center">
                  <p
                    className="font-display text-xl text-ink"
                    style={{ fontVariationSettings: '"opsz" 24' }}
                  >
                    No users match.
                  </p>
                  <p className="mt-1 text-[13px] text-ink-muted">
                    Try a different role or search term.
                  </p>
                </td>
              </tr>
            )}
            {filtered.map((u) => {
              const isSelf = u.id === currentUserId;
              const busy = busyId === u.id && isPending;
              return (
                <tr key={u.id} className="hover:bg-surface-3/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={u.name} size="sm" />
                      <div className="min-w-0">
                        <p className="font-semibold text-ink truncate inline-flex items-center gap-2">
                          {u.name}
                          {isSelf && (
                            <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-[12px] text-ink-muted truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {canMutate && !isSelf ? (
                      <select
                        value={u.role}
                        disabled={busy}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                        className="rounded-md border border-line bg-surface px-2 py-1.5 text-[12px] text-ink focus:outline-none focus:border-brand disabled:opacity-60"
                      >
                        {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABEL[r]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Chip tone={ROLE_TONE[u.role as Role]}>{ROLE_LABEL[u.role as Role]}</Chip>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {u.active ? (
                      <Chip tone="success">Active</Chip>
                    ) : (
                      <Chip tone="neutral">Inactive</Chip>
                    )}
                  </td>
                  <td className="px-5 py-3 text-ink-soft tabular">{formatDate(u.updatedAt)}</td>
                  <td className="px-5 py-3 text-right">
                    {canMutate && (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setResetTarget(u)}
                          disabled={busy}
                          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors disabled:opacity-60"
                          title="Reset password"
                        >
                          <KeyRound className="w-3.5 h-3.5" strokeWidth={1.75} />
                          Reset
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(u.id, u.active)}
                          disabled={busy || isSelf}
                          title={isSelf ? 'You can’t deactivate yourself' : u.active ? 'Deactivate' : 'Reactivate'}
                          className={
                            u.active
                              ? 'inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-soft hover:bg-danger-soft hover:text-danger hover:border-danger/40 transition-colors disabled:opacity-40 disabled:hover:bg-surface disabled:hover:text-ink-soft disabled:hover:border-line'
                              : 'inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-soft hover:bg-success-soft hover:text-success hover:border-success/40 transition-colors disabled:opacity-40 disabled:hover:bg-surface disabled:hover:text-ink-soft disabled:hover:border-line'
                          }
                        >
                          <Power className="w-3.5 h-3.5" strokeWidth={1.75} />
                          {u.active ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {resetTarget && (
        <ResetPasswordDialog
          user={resetTarget}
          onClose={() => setResetTarget(null)}
          onSuccess={() => setResetTarget(null)}
        />
      )}
    </>
  );
}

function ResetPasswordDialog({
  user,
  onClose,
  onSuccess,
}: {
  user: UserRow;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (password.length < 10) {
      setError('Password must be at least 10 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    startTransition(async () => {
      const result = await resetUserPassword({ userId: user.id, newPassword: password });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSuccess();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface border border-line rounded-lg shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 px-5 py-4 border-b border-line-soft">
          <div>
            <p className="eyebrow text-ink-faint">Security action</p>
            <h3
              className="font-display text-lg text-ink leading-tight"
              style={{ fontVariationSettings: '"opsz" 24' }}
            >
              Reset password
            </h3>
            <p className="text-[12.5px] text-ink-muted mt-1 truncate">
              {user.name} · {user.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-faint hover:text-ink transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </header>
        <form onSubmit={submit} className="px-5 py-5 space-y-3">
          <label className="text-[12px] font-semibold text-ink-soft flex flex-col gap-1.5">
            New password
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={10}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-brand"
            />
          </label>
          <label className="text-[12px] font-semibold text-ink-soft flex flex-col gap-1.5">
            Confirm new password
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={10}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-brand"
            />
          </label>
          <p className="text-[11.5px] text-ink-muted leading-[1.55]">
            The user keeps their email. Share the new password with them securely — it
            won’t be shown again.
          </p>
          {error && (
            <p className="text-[12px] text-danger bg-danger-soft/50 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-60"
            >
              <KeyRound className="w-3.5 h-3.5" strokeWidth={2} />
              {isPending ? 'Saving…' : 'Set password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
