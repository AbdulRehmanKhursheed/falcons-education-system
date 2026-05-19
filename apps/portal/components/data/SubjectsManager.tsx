'use client';

import { useMemo, useState, useTransition } from 'react';
import { Plus, X, Pencil, Power, Check } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/cn';
import type { SubjectRow } from '@/lib/queries/timetable';
import {
  createSubject,
  toggleSubjectActive,
  updateSubject,
} from '@/app/(app)/settings/subjects/_actions';

type Props = {
  rows: SubjectRow[];
  canMutate: boolean;
};

type FormState = {
  name: string;
  code: string;
  order: string;
  active: boolean;
};

const blank: FormState = { name: '', code: '', order: '0', active: true };

export function SubjectsManager({ rows, canMutate }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Sort: order asc, then name asc — query already does this but we mirror
  // it client-side for stability across optimistic updates.
  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.name.localeCompare(b.name);
      }),
    [rows],
  );

  function handleCreate(form: FormState) {
    setError(null);
    startTransition(async () => {
      const result = await createSubject({
        name: form.name.trim(),
        code: form.code.trim() || undefined,
        order: Number(form.order) || 0,
        active: form.active,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setShowCreate(false);
    });
  }

  function handleUpdate(id: string, form: FormState) {
    setError(null);
    setBusyId(id);
    startTransition(async () => {
      const result = await updateSubject({
        id,
        name: form.name.trim(),
        code: form.code.trim() || undefined,
        order: Number(form.order) || 0,
        active: form.active,
      });
      if (!result.ok) setError(result.error);
      else setEditingId(null);
      setBusyId(null);
    });
  }

  function handleToggle(id: string) {
    setError(null);
    setBusyId(id);
    startTransition(async () => {
      const result = await toggleSubjectActive(id);
      if (!result.ok) setError(result.error);
      setBusyId(null);
    });
  }

  return (
    <div className="bg-surface border border-line rounded-lg">
      <header className="flex items-center justify-between gap-4 px-5 py-4 border-b border-line-soft">
        <div>
          <p className="eyebrow text-ink-faint">{rows.length} subjects</p>
          <h3
            className="font-display text-lg text-ink leading-tight"
            style={{ fontVariationSettings: '"opsz" 24' }}
          >
            Master subject list
          </h3>
        </div>
        {canMutate && (
          <button
            type="button"
            onClick={() => {
              setShowCreate((s) => !s);
              setError(null);
            }}
            className={
              showCreate
                ? 'inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors'
                : 'inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors'
            }
          >
            {showCreate ? (
              <>
                <X className="w-3.5 h-3.5" strokeWidth={2} /> Cancel
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" strokeWidth={2.25} /> New subject
              </>
            )}
          </button>
        )}
      </header>

      {showCreate && canMutate && (
        <SubjectForm
          initial={blank}
          submitLabel="Create subject"
          submittingLabel="Creating…"
          submitting={isPending && busyId === null}
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {error && (
        <div className="px-5 py-3 border-b border-line-soft bg-danger-soft/40 text-[12.5px] text-danger">
          {error}
        </div>
      )}

      {/* Desktop table */}
      <table className="hidden md:table w-full text-[13px]">
        <thead className="bg-surface-3/60">
          <tr className="text-left text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
            <th className="px-5 py-3 w-12">Order</th>
            <th className="px-5 py-3">Name</th>
            <th className="px-5 py-3">Code</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft">
          {sorted.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-12 text-center">
                <p
                  className="font-display text-xl text-ink"
                  style={{ fontVariationSettings: '"opsz" 24' }}
                >
                  No subjects yet.
                </p>
                <p className="mt-1 text-[13px] text-ink-muted">
                  Add subjects to enable timetable scheduling.
                </p>
              </td>
            </tr>
          )}
          {sorted.map((row) => {
            const busy = busyId === row.id && isPending;
            const isEditing = editingId === row.id;
            if (isEditing && canMutate) {
              return (
                <tr key={row.id} className="bg-surface-3/30">
                  <td colSpan={5} className="px-5 py-4">
                    <SubjectForm
                      initial={{
                        name: row.name,
                        code: row.code ?? '',
                        order: String(row.order),
                        active: row.active,
                      }}
                      submitLabel="Save changes"
                      submittingLabel="Saving…"
                      submitting={busy}
                      onSubmit={(form) => handleUpdate(row.id, form)}
                      onCancel={() => setEditingId(null)}
                    />
                  </td>
                </tr>
              );
            }
            return (
              <tr key={row.id} className="hover:bg-surface-3/40">
                <td className="px-5 py-3 text-ink-soft tabular">{row.order}</td>
                <td className="px-5 py-3 font-semibold text-ink">{row.name}</td>
                <td className="px-5 py-3">
                  {row.code ? (
                    <span className="font-mono text-[12px] text-ink-soft tabular">
                      {row.code}
                    </span>
                  ) : (
                    <span className="text-ink-faint italic text-[12px]">—</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {row.active ? (
                    <Chip tone="success">Active</Chip>
                  ) : (
                    <Chip tone="neutral">Inactive</Chip>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  {canMutate && (
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(row.id);
                          setError(null);
                        }}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors disabled:opacity-60"
                      >
                        <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggle(row.id)}
                        disabled={busy}
                        title={row.active ? 'Deactivate' : 'Activate'}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11.5px] font-semibold transition-colors disabled:opacity-60',
                          row.active
                            ? 'text-ink-soft hover:bg-danger-soft hover:text-danger hover:border-danger/40'
                            : 'text-ink-soft hover:bg-success-soft hover:text-success hover:border-success/40',
                        )}
                      >
                        <Power className="w-3.5 h-3.5" strokeWidth={1.75} />
                        {row.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-line-soft">
        {sorted.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p
              className="font-display text-xl text-ink"
              style={{ fontVariationSettings: '"opsz" 24' }}
            >
              No subjects yet.
            </p>
            <p className="mt-1 text-[13px] text-ink-muted">
              Add subjects to enable timetable scheduling.
            </p>
          </div>
        ) : (
          sorted.map((row) => {
            const busy = busyId === row.id && isPending;
            const isEditing = editingId === row.id;
            if (isEditing && canMutate) {
              return (
                <div key={row.id} className="px-4 py-3.5 bg-surface-3/30">
                  <SubjectForm
                    initial={{
                      name: row.name,
                      code: row.code ?? '',
                      order: String(row.order),
                      active: row.active,
                    }}
                    submitLabel="Save"
                    submittingLabel="Saving…"
                    submitting={busy}
                    onSubmit={(form) => handleUpdate(row.id, form)}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              );
            }
            return (
              <div key={row.id} className="px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink text-[14px] truncate">
                      <span className="text-ink-faint tabular mr-2">{row.order}.</span>
                      {row.name}
                    </p>
                    {row.code && (
                      <p className="mt-0.5 font-mono text-[11.5px] text-ink-soft tabular">
                        {row.code}
                      </p>
                    )}
                  </div>
                  {row.active ? (
                    <Chip tone="success" className="shrink-0">Active</Chip>
                  ) : (
                    <Chip tone="neutral" className="shrink-0">Inactive</Chip>
                  )}
                </div>
                {canMutate && (
                  <div className="mt-3 flex flex-wrap items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(row.id);
                        setError(null);
                      }}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors disabled:opacity-60"
                    >
                      <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggle(row.id)}
                      disabled={busy}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11.5px] font-semibold transition-colors disabled:opacity-60',
                        row.active
                          ? 'text-ink-soft hover:bg-danger-soft hover:text-danger hover:border-danger/40'
                          : 'text-ink-soft hover:bg-success-soft hover:text-success hover:border-success/40',
                      )}
                    >
                      <Power className="w-3.5 h-3.5" strokeWidth={1.75} />
                      {row.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Subject form (used inline for both create + edit) ──────────────────────

function SubjectForm({
  initial,
  submitLabel,
  submittingLabel,
  submitting,
  onSubmit,
  onCancel,
}: {
  initial: FormState;
  submitLabel: string;
  submittingLabel: string;
  submitting: boolean;
  onSubmit: (form: FormState) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(initial);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 sm:grid-cols-12 gap-3"
    >
      <label className="sm:col-span-5 text-[12px] font-semibold text-ink-soft flex flex-col gap-1.5">
        Name
        <input
          required
          minLength={2}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Math"
          className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-brand"
        />
      </label>
      <label className="sm:col-span-3 text-[12px] font-semibold text-ink-soft flex flex-col gap-1.5">
        Code
        <input
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          placeholder="MATH"
          maxLength={8}
          className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] font-mono text-ink focus:outline-none focus:border-brand"
        />
      </label>
      <label className="sm:col-span-2 text-[12px] font-semibold text-ink-soft flex flex-col gap-1.5">
        Order
        <input
          type="number"
          min={0}
          max={999}
          value={form.order}
          onChange={(e) => setForm({ ...form, order: e.target.value })}
          className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink tabular focus:outline-none focus:border-brand"
        />
      </label>
      <label className="sm:col-span-2 flex items-end gap-2 text-[12.5px] text-ink-soft cursor-pointer pb-1.5">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
          className="accent-brand"
        />
        Active
      </label>
      <div className="sm:col-span-12 flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-60"
        >
          <Check className="w-3.5 h-3.5" strokeWidth={2.25} />
          {submitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
