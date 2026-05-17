'use client';

import { useState, useTransition } from 'react';
import {
  Plus,
  Pencil,
  Loader2,
  Power,
  PowerOff,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { formatPKR } from '@/lib/format';
import { cn } from '@/lib/cn';
import {
  upsertFeeStructure,
  toggleFeeStructureActive,
} from '@/app/(app)/fees/structures/_actions';
import type { FeeStructureRow } from '@/lib/queries/fees';

type Classroom = { id: string; name: string };

type EditingState =
  | { kind: 'closed' }
  | { kind: 'creating' }
  | { kind: 'editing'; row: FeeStructureRow };

type Props = {
  initialRows: FeeStructureRow[];
  classrooms: Classroom[];
};

const frequencyOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'one-time', label: 'One-time' },
];

export function FeeStructureManager({ initialRows, classrooms }: Props) {
  const [rows, setRows] = useState(initialRows);
  const [editing, setEditing] = useState<EditingState>({ kind: 'closed' });
  const [toast, setToast] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSave(values: {
    id?: string;
    classroomId: string;
    name: string;
    amount: number;
    frequency: 'monthly' | 'quarterly' | 'one-time';
    active: boolean;
  }) {
    startTransition(async () => {
      const res = await upsertFeeStructure(values);
      if (res.ok) {
        setEditing({ kind: 'closed' });
        setToast(values.id ? 'Fee structure updated' : 'Fee structure created');
        // We rely on revalidatePath to refresh, but optimistically update too.
        if (values.id) {
          setRows((prev) =>
            prev.map((r) =>
              r.id === values.id
                ? {
                    ...r,
                    name: values.name,
                    amount: values.amount,
                    frequency: values.frequency,
                    active: values.active,
                    classroomId: values.classroomId,
                    classroomName:
                      classrooms.find((c) => c.id === values.classroomId)
                        ?.name ?? r.classroomName,
                  }
                : r,
            ),
          );
        } else if (res.data) {
          const className =
            classrooms.find((c) => c.id === values.classroomId)?.name ?? '—';
          setRows((prev) => [
            {
              id: res.data!.id,
              classroomId: values.classroomId,
              classroomName: className,
              name: values.name,
              amount: values.amount,
              frequency: values.frequency,
              active: values.active,
              invoiceCount: 0,
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ]);
        }
      } else {
        setToast(`Error: ${res.error}`);
      }
    });
  }

  function handleToggle(id: string) {
    startTransition(async () => {
      const res = await toggleFeeStructureActive(id);
      if (res.ok && res.data) {
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, active: res.data!.active } : r)),
        );
        setToast(res.data.active ? 'Structure activated' : 'Structure deactivated');
      } else if (!res.ok) {
        setToast(`Error: ${res.error}`);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12.5px] text-ink-muted">
          {rows.length} structure{rows.length === 1 ? '' : 's'} configured
          {pending && (
            <span className="ml-2 inline-flex items-center gap-1 text-ink-faint">
              <Loader2 className="w-3 h-3 animate-spin" strokeWidth={1.75} />
              Working…
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={() => setEditing({ kind: 'creating' })}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.25} />
          New structure
        </button>
      </div>

      {toast && (
        <div className="flex items-center justify-between gap-3 rounded-md bg-surface-2 border border-line px-3.5 py-2.5">
          <p className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" strokeWidth={2} />
            {toast}
          </p>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-ink-faint hover:text-ink"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </div>
      )}

      {editing.kind !== 'closed' && (
        <FeeStructureForm
          classrooms={classrooms}
          initial={editing.kind === 'editing' ? editing.row : undefined}
          submitting={pending}
          onCancel={() => setEditing({ kind: 'closed' })}
          onSubmit={handleSave}
        />
      )}

      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        <table className="w-full text-[13px]">
          <thead className="bg-surface-2 border-b border-line-soft">
            <tr className="text-left">
              {[
                'Classroom',
                'Name',
                'Frequency',
                'Amount',
                'Active',
                'Invoices',
                '',
              ].map((h, i) => (
                <th
                  key={h || `c-${i}`}
                  className={cn(
                    'px-5 py-3 eyebrow text-ink-faint font-semibold whitespace-nowrap',
                    (i === 3 || i === 5) && 'text-right',
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center">
                  <p
                    className="font-display text-lg text-ink"
                    style={{ fontVariationSettings: '"opsz" 24' }}
                  >
                    No fee structures yet.
                  </p>
                  <p className="mt-1 text-[12.5px] text-ink-muted">
                    Create one to enable monthly invoice generation.
                  </p>
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-surface-2 transition-colors">
                <td className="px-5 py-3 text-ink font-medium">
                  {r.classroomName}
                </td>
                <td className="px-5 py-3 text-ink-soft">{r.name}</td>
                <td className="px-5 py-3 text-ink-soft capitalize">
                  {r.frequency}
                </td>
                <td className="px-5 py-3 text-right tabular text-ink font-semibold">
                  {formatPKR(r.amount)}
                </td>
                <td className="px-5 py-3">
                  <Chip tone={r.active ? 'success' : 'neutral'}>
                    {r.active ? 'Active' : 'Inactive'}
                  </Chip>
                </td>
                <td className="px-5 py-3 text-right tabular text-ink-muted">
                  {r.invoiceCount}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggle(r.id)}
                      disabled={pending}
                      title={r.active ? 'Deactivate' : 'Activate'}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-ink-faint hover:text-ink hover:bg-surface-3 transition-all disabled:opacity-60"
                    >
                      {r.active ? (
                        <PowerOff className="w-3.5 h-3.5" strokeWidth={1.75} />
                      ) : (
                        <Power className="w-3.5 h-3.5" strokeWidth={1.75} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing({ kind: 'editing', row: r })}
                      disabled={pending}
                      title="Edit"
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-ink-faint hover:text-ink hover:bg-surface-3 transition-all disabled:opacity-60"
                    >
                      <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FeeStructureForm({
  initial,
  classrooms,
  submitting,
  onCancel,
  onSubmit,
}: {
  initial?: FeeStructureRow;
  classrooms: Classroom[];
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (values: {
    id?: string;
    classroomId: string;
    name: string;
    amount: number;
    frequency: 'monthly' | 'quarterly' | 'one-time';
    active: boolean;
  }) => void;
}) {
  const [classroomId, setClassroomId] = useState(
    initial?.classroomId ?? classrooms[0]?.id ?? '',
  );
  const [name, setName] = useState(initial?.name ?? '');
  const [amount, setAmount] = useState<string>(
    initial ? String(initial.amount) : '',
  );
  const [frequency, setFrequency] = useState<
    'monthly' | 'quarterly' | 'one-time'
  >((initial?.frequency as 'monthly' | 'quarterly' | 'one-time') ?? 'monthly');
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (!classroomId) {
      setError('Pick a classroom');
      return;
    }
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    onSubmit({
      id: initial?.id,
      classroomId,
      name: name.trim(),
      amount: amountNum,
      frequency,
      active,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-line rounded-lg p-5 space-y-4"
    >
      <div className="flex items-baseline justify-between">
        <div>
          <p className="eyebrow text-ink-faint">
            {initial ? 'Edit structure' : 'New structure'}
          </p>
          <h3
            className="font-display text-lg text-ink"
            style={{ fontVariationSettings: '"opsz" 24' }}
          >
            {initial ? initial.name : 'Add a fee structure'}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="space-y-1.5">
          <span className="eyebrow text-ink-faint">Classroom</span>
          <select
            value={classroomId}
            onChange={(e) => setClassroomId(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-line bg-surface-2 text-[13px] text-ink focus:outline-none focus:border-ink focus:bg-surface transition-colors"
          >
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="eyebrow text-ink-faint">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Monthly · Class 3"
            className="w-full px-3 py-2 rounded-md border border-line bg-surface-2 text-[13px] text-ink focus:outline-none focus:border-ink focus:bg-surface transition-colors"
          />
        </label>

        <label className="space-y-1.5">
          <span className="eyebrow text-ink-faint">Frequency</span>
          <select
            value={frequency}
            onChange={(e) =>
              setFrequency(
                e.target.value as 'monthly' | 'quarterly' | 'one-time',
              )
            }
            className="w-full px-3 py-2 rounded-md border border-line bg-surface-2 text-[13px] text-ink focus:outline-none focus:border-ink focus:bg-surface transition-colors"
          >
            {frequencyOptions.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="eyebrow text-ink-faint">Amount (PKR)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-line bg-surface-2 text-[13px] tabular text-ink focus:outline-none focus:border-ink focus:bg-surface transition-colors"
            placeholder="8000"
          />
        </label>
      </div>

      <label className="inline-flex items-center gap-2 text-[13px] text-ink-soft">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="accent-ink"
        />
        Active — included in monthly invoice generation
      </label>

      {error && (
        <p className="text-[12.5px] font-semibold text-danger">{error}</p>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.25} />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.25} />
          )}
          {initial ? 'Save changes' : 'Create'}
        </button>
      </div>
    </form>
  );
}
