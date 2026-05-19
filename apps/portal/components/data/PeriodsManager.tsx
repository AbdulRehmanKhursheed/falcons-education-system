'use client';

import { useMemo, useState, useTransition } from 'react';
import { Plus, X, Pencil, Trash2, Check, Coffee, Clock } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import type { PeriodRow } from '@/lib/queries/timetable';
import {
  createPeriod,
  deletePeriod,
  updatePeriod,
} from '@/app/(app)/settings/periods/_actions';

type Props = {
  rows: PeriodRow[];
  canMutate: boolean;
  entryCountByPeriodId: Record<string, number>;
};

type FormState = {
  number: string;
  startTime: string;
  endTime: string;
  label: string;
  isBreak: boolean;
};

const blank: FormState = {
  number: '',
  startTime: '',
  endTime: '',
  label: '',
  isBreak: false,
};

export function PeriodsManager({ rows, canMutate, entryCountByPeriodId }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sorted = useMemo(
    () => [...rows].sort((a, b) => a.number - b.number),
    [rows],
  );

  function handleCreate(form: FormState) {
    setError(null);
    startTransition(async () => {
      const result = await createPeriod({
        number: Number(form.number),
        startTime: form.startTime,
        endTime: form.endTime,
        label: form.label.trim() || undefined,
        isBreak: form.isBreak,
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
      const result = await updatePeriod({
        id,
        number: Number(form.number),
        startTime: form.startTime,
        endTime: form.endTime,
        label: form.label.trim() || undefined,
        isBreak: form.isBreak,
      });
      if (!result.ok) setError(result.error);
      else setEditingId(null);
      setBusyId(null);
    });
  }

  function handleDelete(row: PeriodRow) {
    const count = entryCountByPeriodId[row.id] ?? 0;
    if (count > 0) {
      setError(
        `Cannot delete period ${row.number} — ${count} timetable ${count === 1 ? 'entry references' : 'entries reference'} it.`,
      );
      return;
    }
    if (
      !confirm(
        `Delete period ${row.number}${row.label ? ` (${row.label})` : ''}? This cannot be undone.`,
      )
    ) {
      return;
    }
    setError(null);
    setBusyId(row.id);
    startTransition(async () => {
      const result = await deletePeriod(row.id);
      if (!result.ok) setError(result.error);
      setBusyId(null);
    });
  }

  return (
    <div className="bg-surface border border-line rounded-lg">
      <header className="flex items-center justify-between gap-4 px-5 py-4 border-b border-line-soft">
        <div>
          <p className="eyebrow text-ink-faint">{rows.length} periods</p>
          <h3
            className="font-display text-lg text-ink leading-tight"
            style={{ fontVariationSettings: '"opsz" 24' }}
          >
            School day schedule
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
                <Plus className="w-3.5 h-3.5" strokeWidth={2.25} /> New period
              </>
            )}
          </button>
        )}
      </header>

      {showCreate && canMutate && (
        <div className="px-5 py-5 border-b border-line-soft bg-surface-3/40">
          <PeriodForm
            initial={{
              ...blank,
              number: String((sorted[sorted.length - 1]?.number ?? 0) + 1),
            }}
            submitLabel="Create period"
            submittingLabel="Creating…"
            submitting={isPending && busyId === null}
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </div>
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
            <th className="px-5 py-3 w-16">No.</th>
            <th className="px-5 py-3">Start</th>
            <th className="px-5 py-3">End</th>
            <th className="px-5 py-3">Label</th>
            <th className="px-5 py-3">Type</th>
            <th className="px-5 py-3">Usage</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft">
          {sorted.length === 0 && (
            <tr>
              <td colSpan={7} className="px-5 py-12 text-center">
                <p
                  className="font-display text-xl text-ink"
                  style={{ fontVariationSettings: '"opsz" 24' }}
                >
                  No periods configured.
                </p>
                <p className="mt-1 text-[13px] text-ink-muted">
                  Periods define the daily blocks used by the timetable.
                </p>
              </td>
            </tr>
          )}
          {sorted.map((row) => {
            const busy = busyId === row.id && isPending;
            const isEditing = editingId === row.id;
            const usage = entryCountByPeriodId[row.id] ?? 0;
            if (isEditing && canMutate) {
              return (
                <tr key={row.id} className="bg-surface-3/30">
                  <td colSpan={7} className="px-5 py-4">
                    <PeriodForm
                      initial={{
                        number: String(row.number),
                        startTime: row.startTime,
                        endTime: row.endTime,
                        label: row.label ?? '',
                        isBreak: row.isBreak,
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
                <td className="px-5 py-3 font-semibold text-ink tabular">{row.number}</td>
                <td className="px-5 py-3 text-ink-soft tabular">{row.startTime}</td>
                <td className="px-5 py-3 text-ink-soft tabular">{row.endTime}</td>
                <td className="px-5 py-3 text-ink">
                  {row.label ?? <span className="text-ink-faint italic">—</span>}
                </td>
                <td className="px-5 py-3">
                  {row.isBreak ? (
                    <Chip tone="warn">
                      <Coffee className="w-3 h-3 inline-block mr-1" strokeWidth={2} />
                      Break
                    </Chip>
                  ) : (
                    <Chip tone="info">
                      <Clock className="w-3 h-3 inline-block mr-1" strokeWidth={2} />
                      Teaching
                    </Chip>
                  )}
                </td>
                <td className="px-5 py-3 text-ink-soft tabular">{usage}</td>
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
                        onClick={() => handleDelete(row)}
                        disabled={busy || usage > 0}
                        title={
                          usage > 0
                            ? `In use by ${usage} timetable entries`
                            : 'Delete'
                        }
                        className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-soft hover:bg-danger-soft hover:text-danger hover:border-danger/40 transition-colors disabled:opacity-40 disabled:hover:bg-surface disabled:hover:text-ink-soft disabled:hover:border-line"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
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
              No periods configured.
            </p>
            <p className="mt-1 text-[13px] text-ink-muted">
              Periods define the daily blocks used by the timetable.
            </p>
          </div>
        ) : (
          sorted.map((row) => {
            const busy = busyId === row.id && isPending;
            const isEditing = editingId === row.id;
            const usage = entryCountByPeriodId[row.id] ?? 0;
            if (isEditing && canMutate) {
              return (
                <div key={row.id} className="px-4 py-3.5 bg-surface-3/30">
                  <PeriodForm
                    initial={{
                      number: String(row.number),
                      startTime: row.startTime,
                      endTime: row.endTime,
                      label: row.label ?? '',
                      isBreak: row.isBreak,
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
                    <p className="font-semibold text-ink text-[14px]">
                      <span className="text-ink-faint tabular mr-2">{row.number}.</span>
                      {row.label ?? 'Untitled'}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-ink-soft tabular">
                      {row.startTime} → {row.endTime}
                    </p>
                  </div>
                  {row.isBreak ? (
                    <Chip tone="warn" className="shrink-0">Break</Chip>
                  ) : (
                    <Chip tone="info" className="shrink-0">Teaching</Chip>
                  )}
                </div>
                <p className="mt-2 text-[11.5px] eyebrow text-ink-faint">
                  Usage{' '}
                  <span className="tabular text-ink font-semibold normal-case tracking-normal ml-1">
                    {usage}
                  </span>
                </p>
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
                      onClick={() => handleDelete(row)}
                      disabled={busy || usage > 0}
                      title={
                        usage > 0
                          ? `In use by ${usage} timetable entries`
                          : 'Delete'
                      }
                      className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-soft hover:bg-danger-soft hover:text-danger hover:border-danger/40 transition-colors disabled:opacity-40 disabled:hover:bg-surface disabled:hover:text-ink-soft disabled:hover:border-line"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
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

// ── Period form ───────────────────────────────────────────────────────────

function PeriodForm({
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
      <label className="sm:col-span-2 text-[12px] font-semibold text-ink-soft flex flex-col gap-1.5">
        Number
        <input
          required
          type="number"
          min={1}
          max={20}
          value={form.number}
          onChange={(e) => setForm({ ...form, number: e.target.value })}
          className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink tabular focus:outline-none focus:border-brand"
        />
      </label>
      <label className="sm:col-span-2 text-[12px] font-semibold text-ink-soft flex flex-col gap-1.5">
        Start
        <input
          required
          type="time"
          value={form.startTime}
          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink tabular focus:outline-none focus:border-brand"
        />
      </label>
      <label className="sm:col-span-2 text-[12px] font-semibold text-ink-soft flex flex-col gap-1.5">
        End
        <input
          required
          type="time"
          value={form.endTime}
          onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink tabular focus:outline-none focus:border-brand"
        />
      </label>
      <label className="sm:col-span-4 text-[12px] font-semibold text-ink-soft flex flex-col gap-1.5">
        Label
        <input
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          placeholder="Period 1, Assembly, Break"
          maxLength={60}
          className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-brand"
        />
      </label>
      <label className="sm:col-span-2 flex items-end gap-2 text-[12.5px] text-ink-soft cursor-pointer pb-1.5">
        <input
          type="checkbox"
          checked={form.isBreak}
          onChange={(e) => setForm({ ...form, isBreak: e.target.checked })}
          className="accent-brand"
        />
        Is a break
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
