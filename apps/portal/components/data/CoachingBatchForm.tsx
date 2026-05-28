'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  createBatch,
  updateBatch,
  toggleBatchActive,
} from '@/app/(app)/coaching/actions';
import type {
  CreateBatchInput,
  CoachingLevelInput,
} from '@/lib/schemas/coaching';
import { Archive, RefreshCcw } from 'lucide-react';

type Weekday = NonNullable<CreateBatchInput['weekdays']>[number];

const levels: Array<{ value: CoachingLevelInput; label: string }> = [
  { value: 'MATRIC_9', label: 'Matric — Class 9' },
  { value: 'MATRIC_10', label: 'Matric — Class 10' },
  { value: 'FSC_1', label: 'FSc — Part 1' },
  { value: 'FSC_2', label: 'FSc — Part 2' },
  { value: 'O_LEVEL', label: 'O-Level' },
  { value: 'A_LEVEL', label: 'A-Level' },
  { value: 'MDCAT', label: 'MDCAT' },
  { value: 'ECAT', label: 'ECAT' },
  { value: 'GENERAL', label: 'General / mixed' },
];

const weekdayOrder: Array<{ value: Weekday; label: string }> = [
  { value: 'MON', label: 'Mon' },
  { value: 'TUE', label: 'Tue' },
  { value: 'WED', label: 'Wed' },
  { value: 'THU', label: 'Thu' },
  { value: 'FRI', label: 'Fri' },
  { value: 'SAT', label: 'Sat' },
  { value: 'SUN', label: 'Sun' },
];

type Mode =
  | { kind: 'create' }
  | { kind: 'edit'; batchId: string; isActive: boolean };

type Props = {
  mode: Mode;
  teachers: Array<{ id: string; name: string }>;
  initial?: Partial<CreateBatchInput> & { teacherId?: string | null };
};

export function CoachingBatchForm({ mode, teachers, initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isArchiving, startArchive] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? '');
  const [subject, setSubject] = useState(initial?.subject ?? '');
  const [level, setLevel] = useState<CoachingLevelInput>(
    initial?.level ?? 'MATRIC_10',
  );
  const [weekdays, setWeekdays] = useState<Weekday[]>(
    initial?.weekdays ?? ['MON', 'WED', 'FRI'],
  );
  const [startTime, setStartTime] = useState(initial?.startTime ?? '17:00');
  const [endTime, setEndTime] = useState(initial?.endTime ?? '18:30');
  const [teacherId, setTeacherId] = useState(initial?.teacherId ?? '');
  const [monthlyFee, setMonthlyFee] = useState<string>(
    initial?.monthlyFee != null ? String(initial.monthlyFee) : '4000',
  );
  const [capacity, setCapacity] = useState<string>(
    initial?.capacity != null ? String(initial.capacity) : '20',
  );
  const [notes, setNotes] = useState(initial?.notes ?? '');

  function toggleWeekday(d: Weekday) {
    setWeekdays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const payload: CreateBatchInput = {
      name,
      subject,
      level,
      weekdays,
      startTime,
      endTime,
      teacherId: teacherId || undefined,
      monthlyFee: Number(monthlyFee),
      capacity: Number(capacity),
      notes: notes || undefined,
    };
    startTransition(async () => {
      const res =
        mode.kind === 'create'
          ? await createBatch(payload)
          : await updateBatch(mode.batchId, payload);
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      const target =
        mode.kind === 'create' && res.data
          ? `/coaching/${(res.data as { batchId: string }).batchId}`
          : `/coaching/${mode.kind === 'edit' ? mode.batchId : ''}`;
      router.push(target);
      router.refresh();
    });
  }

  function archive() {
    if (mode.kind !== 'edit') return;
    const next = !mode.isActive;
    const verb = next ? 'restore' : 'archive';
    if (!window.confirm(`Are you sure you want to ${verb} this batch?`)) return;
    setErr(null);
    startArchive(async () => {
      const res = await toggleBatchActive(mode.batchId, next);
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <h3
        className="font-display text-lg text-ink"
        style={{ fontVariationSettings: '"opsz" 24' }}
      >
        Batch details
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Batch name" required>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Matric Physics — Evening"
            className={inputCls}
          />
        </Field>
        <Field label="Subject" required>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="Physics, Chemistry, Maths…"
            className={inputCls}
          />
        </Field>
        <Field label="Level" required>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as CoachingLevelInput)}
            className={inputCls}
          >
            {levels.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Assigned teacher">
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className={inputCls}
          >
            <option value="">— Unassigned —</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Weekdays" required>
        <div className="flex flex-wrap gap-1.5">
          {weekdayOrder.map((d) => {
            const active = weekdays.includes(d.value);
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => toggleWeekday(d.value)}
                aria-pressed={active}
                className={
                  active
                    ? 'px-3 py-1.5 rounded-md border border-ink bg-ink text-paper text-[12.5px] font-semibold transition-colors'
                    : 'px-3 py-1.5 rounded-md border border-line bg-surface-2 text-ink-soft text-[12.5px] font-semibold hover:border-ink-faint hover:text-ink transition-colors'
                }
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Start time" required>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className={inputCls}
          />
        </Field>
        <Field label="End time" required>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className={inputCls}
          />
        </Field>
        <Field label="Monthly fee (PKR)" required>
          <input
            type="number"
            min={0}
            step={100}
            value={monthlyFee}
            onChange={(e) => setMonthlyFee(e.target.value)}
            required
            className={inputCls}
          />
        </Field>
        <Field label="Capacity" required>
          <input
            type="number"
            min={1}
            step={1}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Internal notes — material, prerequisites, etc."
          className={`${inputCls} resize-y`}
        />
      </Field>

      {err && (
        <p className="text-[12px] text-danger bg-danger-soft px-3 py-2 rounded-md border border-danger/20">
          {err}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-60"
        >
          {isPending
            ? mode.kind === 'create'
              ? 'Creating…'
              : 'Saving…'
            : mode.kind === 'create'
              ? 'Create batch'
              : 'Save changes'}
        </button>
        <Link
          href={mode.kind === 'edit' ? `/coaching/${mode.batchId}` : '/coaching'}
          className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-4 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
        >
          Cancel
        </Link>

        {mode.kind === 'edit' && (
          <button
            type="button"
            onClick={archive}
            disabled={isArchiving}
            className={
              mode.isActive
                ? 'ml-auto inline-flex items-center gap-2 rounded-md border border-danger/40 bg-danger-soft px-3 py-2 text-[12.5px] font-semibold text-danger hover:bg-danger hover:text-paper hover:border-danger transition-colors disabled:opacity-60'
                : 'ml-auto inline-flex items-center gap-2 rounded-md border border-line bg-surface-2 px-3 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-ink hover:text-paper hover:border-ink transition-colors disabled:opacity-60'
            }
          >
            {mode.isActive ? (
              <>
                <Archive className="w-3.5 h-3.5" strokeWidth={2} />
                {isArchiving ? 'Archiving…' : 'Archive batch'}
              </>
            ) : (
              <>
                <RefreshCcw className="w-3.5 h-3.5" strokeWidth={2} />
                {isArchiving ? 'Restoring…' : 'Restore batch'}
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}

const inputCls =
  'w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink focus:bg-surface transition-colors';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-ink-faint block mb-1.5">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}
