'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createApplication } from '@/app/(app)/admissions/[id]/_actions';
import type { CreateApplicationInput } from '@/lib/schemas/admissions';

const programs: Array<{ value: CreateApplicationInput['programInterest']; label: string }> = [
  { value: 'NURSERY', label: 'Nursery' },
  { value: 'MONTESSORI', label: 'Montessori' },
  { value: 'KINDERGARTEN', label: 'Kindergarten' },
  { value: 'PRIMARY', label: 'Primary (Class 1–6)' },
  { value: 'EVENING_COACHING', label: 'Evening coaching' },
  { value: 'SATURDAY_COACHING', label: 'Saturday coaching' },
  { value: 'COMPUTER_COURSE', label: 'Computer course' },
];

const sources: Array<{ value: CreateApplicationInput['source']; label: string }> = [
  { value: 'WEBSITE', label: 'Website' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'WALK_IN', label: 'Walk-in' },
  { value: 'REFERRAL', label: 'Referral' },
];

export function ApplicationCreateForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const [applicantName, setApplicantName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [childAge, setChildAge] = useState('');
  const [programInterest, setProgramInterest] =
    useState<CreateApplicationInput['programInterest']>('PRIMARY');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [source, setSource] = useState<CreateApplicationInput['source']>('WALK_IN');
  const [notes, setNotes] = useState('');

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    startTransition(async () => {
      const res = await createApplication({
        applicantName,
        dateOfBirth: dateOfBirth || undefined,
        childAge,
        programInterest,
        parentName,
        parentPhone,
        parentEmail: parentEmail || undefined,
        source,
        notes: notes || undefined,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.push(`/admissions/${res.data!.applicationId}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <h3
        className="font-display text-lg text-ink"
        style={{ fontVariationSettings: '"opsz" 24' }}
      >
        Applicant
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Applicant name" required>
          <input
            value={applicantName}
            onChange={(e) => setApplicantName(e.target.value)}
            required
            className={inputCls}
          />
        </Field>
        <Field label="Program interest" required>
          <select
            value={programInterest}
            onChange={(e) =>
              setProgramInterest(e.target.value as CreateApplicationInput['programInterest'])
            }
            className={inputCls}
          >
            {programs.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Child age" required>
          <input
            value={childAge}
            onChange={(e) => setChildAge(e.target.value)}
            placeholder="e.g. 3 yrs 4 mo"
            required
            className={inputCls}
          />
        </Field>
        <Field label="Date of birth">
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <h3
        className="font-display text-lg text-ink pt-2"
        style={{ fontVariationSettings: '"opsz" 24' }}
      >
        Parent contact
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Parent name" required>
          <input
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            required
            className={inputCls}
          />
        </Field>
        <Field label="Parent phone" required>
          <input
            value={parentPhone}
            onChange={(e) => setParentPhone(e.target.value)}
            placeholder="+92 3xx xxxxxxx"
            required
            className={inputCls}
          />
        </Field>
        <Field label="Parent email">
          <input
            type="email"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Source" required>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as CreateApplicationInput['source'])}
            className={inputCls}
          >
            {sources.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Anything the parent mentioned worth capturing…"
          className={`${inputCls} resize-y`}
        />
      </Field>

      {err && (
        <p className="text-[12px] text-danger bg-danger-soft px-3 py-2 rounded-md border border-danger/20">
          {err}
        </p>
      )}

      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-60"
        >
          {isPending ? 'Creating…' : 'Create application'}
        </button>
        <Link
          href="/admissions"
          className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-4 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
        >
          Cancel
        </Link>
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
