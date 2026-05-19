'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateStudent } from '@/app/(app)/students/[id]/_actions';
import type { UpdateStudentInput } from '@/lib/schemas/students';
import { Uploader } from '@/components/ui/Uploader';

type Props = {
  studentId: string;
  initial: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string | null;
    bloodGroup: string | null;
    status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE' | 'GRADUATED';
    admissionDate: string | null;
    photoUrl: string | null;
    notes: string | null;
  };
};

const statuses: Array<{ value: UpdateStudentInput['status']; label: string }> = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_LEAVE', label: 'On leave' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'GRADUATED', label: 'Graduated' },
];

function toDateInput(iso: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function StudentEditForm({ studentId, initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [dateOfBirth, setDateOfBirth] = useState(toDateInput(initial.dateOfBirth));
  const [gender, setGender] = useState<'female' | 'male' | 'other' | ''>(
    (initial.gender as 'female' | 'male' | 'other' | null) ?? '',
  );
  const [bloodGroup, setBloodGroup] = useState(initial.bloodGroup ?? '');
  const [status, setStatus] = useState<UpdateStudentInput['status']>(initial.status);
  const [admissionDate, setAdmissionDate] = useState(toDateInput(initial.admissionDate));
  const [photoUrl, setPhotoUrl] = useState(initial.photoUrl ?? '');
  const [notes, setNotes] = useState(initial.notes ?? '');

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    startTransition(async () => {
      const res = await updateStudent(studentId, {
        firstName,
        lastName,
        dateOfBirth,
        gender: gender ? gender : undefined,
        bloodGroup: bloodGroup || undefined,
        status,
        admissionDate: admissionDate || undefined,
        photoUrl: photoUrl || undefined,
        notes: notes || undefined,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.push(`/students/${studentId}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First name" required>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className={inputCls}
          />
        </Field>
        <Field label="Last name" required>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className={inputCls}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Date of birth" required>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
            className={inputCls}
          />
        </Field>
        <Field label="Admission date">
          <input
            type="date"
            value={admissionDate}
            onChange={(e) => setAdmissionDate(e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Gender">
          <div className="flex gap-3 mt-1">
            {(['female', 'male', 'other'] as const).map((g) => (
              <label
                key={g}
                className="inline-flex items-center gap-1.5 text-[13px] text-ink-soft cursor-pointer"
              >
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={gender === g}
                  onChange={() => setGender(g)}
                />
                {g[0].toUpperCase() + g.slice(1)}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Blood group">
          <input
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            placeholder="e.g. A+"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Status" required>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as UpdateStudentInput['status'])}
          className={inputCls}
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Photo">
        <Uploader
          endpoint="studentPhoto"
          value={photoUrl}
          onChange={(url) => setPhotoUrl(url)}
          variant="button"
          placeholder="https://… (paste a public image URL)"
        />
      </Field>

      <Field label="Notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Medical info, allergies, reminders…"
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
          {isPending ? 'Saving…' : 'Save changes'}
        </button>
        <Link
          href={`/students/${studentId}`}
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
