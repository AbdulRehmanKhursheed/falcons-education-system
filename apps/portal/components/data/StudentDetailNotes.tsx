'use client';

import { useState, useTransition } from 'react';
import { Save, Pencil, X } from 'lucide-react';
import { updateStudent } from '@/app/(app)/students/[id]/_actions';
import type { UpdateStudentInput } from '@/lib/schemas/students';

type Props = {
  studentId: string;
  initial: {
    firstName: string;
    lastName: string;
    dateOfBirth: string; // ISO
    gender: string | null;
    bloodGroup: string | null;
    status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE' | 'GRADUATED';
    admissionDate: string | null; // ISO
    photoUrl: string | null;
    notes: string | null;
  };
};

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function StudentDetailNotes({ studentId, initial }: Props) {
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(initial.notes ?? '');
  const [saved, setSaved] = useState(initial.notes ?? '');
  const [err, setErr] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function save() {
    setErr(null);
    startTransition(async () => {
      const input: UpdateStudentInput = {
        firstName: initial.firstName,
        lastName: initial.lastName,
        dateOfBirth: toDateInputValue(initial.dateOfBirth),
        gender:
          initial.gender === 'female' ||
          initial.gender === 'male' ||
          initial.gender === 'other'
            ? initial.gender
            : undefined,
        bloodGroup: initial.bloodGroup ?? undefined,
        status: initial.status,
        admissionDate: toDateInputValue(initial.admissionDate),
        photoUrl: initial.photoUrl ?? undefined,
        notes: notes.trim() || undefined,
      };
      const res = await updateStudent(studentId, input);
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setSaved(notes);
      setEditing(false);
    });
  }

  function cancel() {
    setNotes(saved);
    setEditing(false);
    setErr(null);
  }

  if (!editing) {
    return (
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[13px] text-ink-soft whitespace-pre-wrap min-h-[1.5rem]">
            {saved.trim() ? saved : <span className="italic text-ink-faint">No notes.</span>}
          </p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors shrink-0"
          >
            <Pencil className="w-3 h-3" strokeWidth={2} />
            Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-4">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={5}
        placeholder="Medical, allergies, dietary preferences, parent reminders…"
        className="w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink focus:bg-surface transition-colors resize-y"
      />
      {err && <p className="mt-2 text-[11.5px] text-danger">{err}</p>}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-3 py-1.5 text-[12px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-60"
        >
          <Save className="w-3 h-3" strokeWidth={2} />
          {isPending ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-[12px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
        >
          <X className="w-3 h-3" strokeWidth={2} />
          Cancel
        </button>
      </div>
    </div>
  );
}
