'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, UserPlus, Users, X } from 'lucide-react';
import { createStudent } from '@/app/(app)/students/[id]/_actions';
import { searchGuardianAction } from '@/app/(app)/students/new/_actions';
import type { ClassroomOption, GuardianSearchResult } from '@/lib/queries/student-detail';
import type { CreateStudentInput } from '@/lib/schemas/students';

type Props = { classrooms: ClassroomOption[] };

const statuses: Array<{ value: NonNullable<CreateStudentInput['student']['status']>; label: string }> = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_LEAVE', label: 'On leave' },
];

export function StudentCreateForm({ classrooms }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  // Student
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'female' | 'male' | 'other' | ''>('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [status, setStatus] = useState<NonNullable<CreateStudentInput['student']['status']>>('ACTIVE');
  const [admissionDate, setAdmissionDate] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [classroomId, setClassroomId] = useState(classrooms[0]?.id ?? '');

  // Guardian
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [guardianSearchQuery, setGuardianSearchQuery] = useState('');
  const [guardianResults, setGuardianResults] = useState<GuardianSearchResult[]>([]);
  const [pickedGuardian, setPickedGuardian] = useState<GuardianSearchResult | null>(null);
  const [searching, setSearching] = useState(false);

  const [gName, setGName] = useState('');
  const [gRelation, setGRelation] = useState('Father');
  const [gPhone, setGPhone] = useState('');
  const [gWhatsapp, setGWhatsapp] = useState('');
  const [gEmail, setGEmail] = useState('');
  const [gOccupation, setGOccupation] = useState('');
  const [gCnic, setGCnic] = useState('');

  async function runSearch(q: string) {
    setGuardianSearchQuery(q);
    if (q.trim().length < 2) {
      setGuardianResults([]);
      return;
    }
    setSearching(true);
    try {
      const rows = await searchGuardianAction(q);
      setGuardianResults(rows);
    } finally {
      setSearching(false);
    }
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);

    if (!classroomId) {
      setErr('Classroom is required');
      return;
    }
    if (mode === 'existing' && !pickedGuardian) {
      setErr('Pick an existing guardian or switch to "Create new"');
      return;
    }

    const input: CreateStudentInput = {
      student: {
        firstName,
        lastName,
        dateOfBirth,
        gender: gender || undefined,
        bloodGroup: bloodGroup || undefined,
        status,
        admissionDate: admissionDate || undefined,
        photoUrl: photoUrl || undefined,
        notes: notes || undefined,
      },
      classroomId,
      guardian:
        mode === 'existing'
          ? { mode: 'existing', guardianId: pickedGuardian!.id }
          : {
              mode: 'new',
              fullName: gName,
              relation: gRelation,
              phone: gPhone,
              whatsapp: gWhatsapp || undefined,
              email: gEmail || undefined,
              occupation: gOccupation || undefined,
              cnic: gCnic || undefined,
            },
    };

    startTransition(async () => {
      const res = await createStudent(input);
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.push(`/students/${res.data!.studentId}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-7">
      {/* Student section */}
      <section>
        <SectionHeader title="Student" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First name" required>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputCls} />
          </Field>
          <Field label="Last name" required>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputCls} />
          </Field>
          <Field label="Date of birth" required>
            <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required className={inputCls} />
          </Field>
          <Field label="Admission date">
            <input type="date" value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Gender">
            <div className="flex gap-3 mt-1">
              {(['female', 'male', 'other'] as const).map((g) => (
                <label key={g} className="inline-flex items-center gap-1.5 text-[13px] text-ink-soft cursor-pointer">
                  <input type="radio" name="gender" value={g} checked={gender === g} onChange={() => setGender(g)} />
                  {g[0].toUpperCase() + g.slice(1)}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Blood group">
            <input value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} placeholder="A+" className={inputCls} />
          </Field>
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={inputCls}>
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Classroom" required>
            <select value={classroomId} onChange={(e) => setClassroomId(e.target.value)} required className={inputCls}>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Photo URL">
            <input type="url" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://…" className={inputCls} />
          </Field>
        </div>
        <Field label="Notes" className="mt-4">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Medical, allergies, reminders…" className={`${inputCls} resize-y`} />
        </Field>
      </section>

      {/* Guardian section */}
      <section>
        <SectionHeader title="Primary guardian" />

        <div className="inline-flex rounded-md border border-line bg-surface-2 p-0.5 mb-4">
          <button
            type="button"
            onClick={() => {
              setMode('new');
              setPickedGuardian(null);
            }}
            className={tabCls(mode === 'new')}
          >
            <UserPlus className="w-3 h-3" strokeWidth={2} />
            Create new
          </button>
          <button
            type="button"
            onClick={() => setMode('existing')}
            className={tabCls(mode === 'existing')}
          >
            <Users className="w-3 h-3" strokeWidth={2} />
            Find existing
          </button>
        </div>

        {mode === 'new' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full name" required>
              <input value={gName} onChange={(e) => setGName(e.target.value)} required className={inputCls} />
            </Field>
            <Field label="Relation" required>
              <select value={gRelation} onChange={(e) => setGRelation(e.target.value)} className={inputCls}>
                <option>Father</option>
                <option>Mother</option>
                <option>Guardian</option>
                <option>Grandparent</option>
                <option>Sibling</option>
              </select>
            </Field>
            <Field label="Phone" required>
              <input value={gPhone} onChange={(e) => setGPhone(e.target.value)} required placeholder="+92 3xx xxxxxxx" className={inputCls} />
            </Field>
            <Field label="WhatsApp">
              <input value={gWhatsapp} onChange={(e) => setGWhatsapp(e.target.value)} placeholder="+92 3xx xxxxxxx" className={inputCls} />
            </Field>
            <Field label="Email">
              <input type="email" value={gEmail} onChange={(e) => setGEmail(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Occupation">
              <input value={gOccupation} onChange={(e) => setGOccupation(e.target.value)} className={inputCls} />
            </Field>
            <Field label="CNIC">
              <input value={gCnic} onChange={(e) => setGCnic(e.target.value)} placeholder="xxxxx-xxxxxxx-x" className={inputCls} />
            </Field>
          </div>
        ) : (
          <div>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint" strokeWidth={1.75} />
              <input
                type="text"
                value={guardianSearchQuery}
                onChange={(e) => runSearch(e.target.value)}
                placeholder="Search by phone or name…"
                className="w-full pl-9 pr-4 py-2 rounded-md border border-line bg-surface-2 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink focus:bg-surface transition-colors"
              />
            </div>

            {pickedGuardian ? (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-line bg-surface-2 px-3 py-2.5 max-w-md">
                <div className="min-w-0">
                  <p className="font-semibold text-ink text-[13px] truncate">{pickedGuardian.fullName}</p>
                  <p className="font-mono text-[11px] text-ink-faint tabular truncate">
                    {pickedGuardian.relation} · {pickedGuardian.phone}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPickedGuardian(null)}
                  className="text-ink-faint hover:text-ink"
                  aria-label="Clear"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
            ) : (
              <ul className="mt-3 divide-y divide-line-soft border border-line rounded-md max-w-md">
                {searching && (
                  <li className="px-3 py-3 text-[12px] text-ink-faint">Searching…</li>
                )}
                {!searching && guardianResults.length === 0 && guardianSearchQuery.length >= 2 && (
                  <li className="px-3 py-3 text-[12px] text-ink-faint italic">No matches</li>
                )}
                {guardianResults.map((g) => (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => setPickedGuardian(g)}
                      className="w-full text-left px-3 py-2.5 hover:bg-surface-3 transition-colors"
                    >
                      <p className="font-semibold text-ink text-[13px] truncate">{g.fullName}</p>
                      <p className="font-mono text-[11px] text-ink-faint tabular truncate">
                        {g.relation} · {g.phone}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {err && (
        <p className="text-[12px] text-danger bg-danger-soft px-3 py-2 rounded-md border border-danger/20">
          {err}
        </p>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-line-soft pt-5">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-60"
        >
          {isPending ? 'Creating…' : 'Create student'}
        </button>
        <Link
          href="/students"
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

function tabCls(active: boolean): string {
  return `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] text-[12px] font-semibold transition-colors ${
    active ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
  }`;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h3
      className="font-display text-lg text-ink mb-4"
      style={{ fontVariationSettings: '"opsz" 24' }}
    >
      {title}
    </h3>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className="eyebrow text-ink-faint block mb-1.5">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}
