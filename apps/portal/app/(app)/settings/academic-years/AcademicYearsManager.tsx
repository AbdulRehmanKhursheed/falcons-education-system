'use client';

import { useState, useTransition } from 'react';
import { Plus, Star, Trash2, CheckCircle2, X } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { formatDate } from '@/lib/format';
import type { AcademicYearRow } from '@/lib/queries/settings';
import {
  createAcademicYear,
  deleteAcademicYear,
  setCurrentAcademicYear,
} from '@/app/(app)/settings/_actions';

type Props = {
  rows: AcademicYearRow[];
};

export function AcademicYearsManager({ rows }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  function resetForm() {
    setName('');
    setStartDate('');
    setEndDate('');
    setError(null);
  }

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createAcademicYear({
        name: name.trim(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setShowForm(false);
      resetForm();
    });
  }

  function handleSetCurrent(id: string) {
    setError(null);
    setBusyId(id);
    startTransition(async () => {
      const result = await setCurrentAcademicYear(id);
      if (!result.ok) setError(result.error);
      setBusyId(null);
    });
  }

  function handleDelete(id: string, name: string) {
    setError(null);
    if (!confirm(`Delete academic year "${name}"? This cannot be undone.`)) return;
    setBusyId(id);
    startTransition(async () => {
      const result = await deleteAcademicYear(id);
      if (!result.ok) setError(result.error);
      setBusyId(null);
    });
  }

  return (
    <div className="bg-surface border border-line rounded-lg">
      <header className="flex items-center justify-between gap-4 px-5 py-4 border-b border-line-soft">
        <div>
          <p className="eyebrow text-ink-faint">{rows.length} on record</p>
          <h3
            className="font-display text-lg text-ink leading-tight"
            style={{ fontVariationSettings: '"opsz" 24' }}
          >
            Academic years
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className={
            showForm
              ? 'inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors'
              : 'inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors'
          }
        >
          {showForm ? (
            <>
              <X className="w-3.5 h-3.5" strokeWidth={2} /> Cancel
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" strokeWidth={2.25} /> New year
            </>
          )}
        </button>
      </header>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="px-5 py-5 border-b border-line-soft bg-surface-3/40 grid grid-cols-1 sm:grid-cols-4 gap-3"
        >
          <label className="text-[12px] font-semibold text-ink-soft flex flex-col gap-1.5">
            Name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="2027-28"
              className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-brand"
            />
          </label>
          <label className="text-[12px] font-semibold text-ink-soft flex flex-col gap-1.5">
            Start date
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-brand"
            />
          </label>
          <label className="text-[12px] font-semibold text-ink-soft flex flex-col gap-1.5">
            End date
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-brand"
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-60"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.25} />
              {isPending ? 'Creating…' : 'Create year'}
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="px-5 py-3 border-b border-line-soft bg-danger-soft/40 text-[12.5px] text-danger">
          {error}
        </div>
      )}

      {/* Mobile cards — shown < md */}
      <div className="md:hidden divide-y divide-line-soft">
        {rows.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p
              className="font-display text-xl text-ink"
              style={{ fontVariationSettings: '"opsz" 24' }}
            >
              No academic years yet.
            </p>
            <p className="mt-1 text-[13px] text-ink-muted">
              Create your first one to start adding classrooms.
            </p>
          </div>
        ) : (
          rows.map((r) => {
            const busy = busyId === r.id && isPending;
            return (
              <div key={r.id} className="px-4 py-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink text-[14px] tabular truncate">
                      {r.name}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-ink-faint tabular">
                      {formatDate(r.startDate)} &rarr; {formatDate(r.endDate)}
                    </p>
                  </div>
                  {r.isCurrent ? (
                    <Chip tone="success" className="shrink-0">
                      <Star className="w-3 h-3 inline-block mr-1" strokeWidth={2.25} />
                      Current
                    </Chip>
                  ) : (
                    <Chip tone="neutral" className="shrink-0">Archived</Chip>
                  )}
                </div>

                <p className="mt-2 text-[11.5px] eyebrow text-ink-faint">
                  Classrooms{' '}
                  <span className="tabular text-ink font-semibold normal-case tracking-normal ml-1">
                    {r.classroomCount}
                  </span>
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-end gap-1.5">
                  {!r.isCurrent && (
                    <button
                      type="button"
                      onClick={() => handleSetCurrent(r.id)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors disabled:opacity-60"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                      Set current
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id, r.name)}
                    disabled={busy || r.isCurrent || r.classroomCount > 0}
                    title={
                      r.isCurrent
                        ? 'Set another year as current first'
                        : r.classroomCount > 0
                          ? 'Remove classrooms before deleting'
                          : 'Delete'
                    }
                    className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-soft hover:bg-danger-soft hover:text-danger hover:border-danger/40 transition-colors disabled:opacity-40 disabled:hover:bg-surface disabled:hover:text-ink-soft disabled:hover:border-line"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
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
            <th className="px-5 py-3">Name</th>
            <th className="px-5 py-3">Starts</th>
            <th className="px-5 py-3">Ends</th>
            <th className="px-5 py-3">Classrooms</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft">
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-12 text-center">
                <p
                  className="font-display text-xl text-ink"
                  style={{ fontVariationSettings: '"opsz" 24' }}
                >
                  No academic years yet.
                </p>
                <p className="mt-1 text-[13px] text-ink-muted">
                  Create your first one to start adding classrooms.
                </p>
              </td>
            </tr>
          )}
          {rows.map((r) => {
            const busy = busyId === r.id && isPending;
            return (
              <tr key={r.id} className="hover:bg-surface-3/40">
                <td className="px-5 py-3 font-semibold text-ink tabular">{r.name}</td>
                <td className="px-5 py-3 text-ink-soft">{formatDate(r.startDate)}</td>
                <td className="px-5 py-3 text-ink-soft">{formatDate(r.endDate)}</td>
                <td className="px-5 py-3 text-ink-soft tabular">{r.classroomCount}</td>
                <td className="px-5 py-3">
                  {r.isCurrent ? (
                    <Chip tone="success">
                      <Star className="w-3 h-3 inline-block mr-1" strokeWidth={2.25} />
                      Current
                    </Chip>
                  ) : (
                    <Chip tone="neutral">Archived</Chip>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    {!r.isCurrent && (
                      <button
                        type="button"
                        onClick={() => handleSetCurrent(r.id)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors disabled:opacity-60"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                        Set current
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id, r.name)}
                      disabled={busy || r.isCurrent || r.classroomCount > 0}
                      title={
                        r.isCurrent
                          ? 'Set another year as current first'
                          : r.classroomCount > 0
                            ? 'Remove classrooms before deleting'
                            : 'Delete'
                      }
                      className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-soft hover:bg-danger-soft hover:text-danger hover:border-danger/40 transition-colors disabled:opacity-40 disabled:hover:bg-surface disabled:hover:text-ink-soft disabled:hover:border-line"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
