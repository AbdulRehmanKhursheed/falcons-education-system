'use client';

/**
 * Create / edit form for a Homework post.
 *
 * The form is a single uncontrolled <form> wired to the matching server action
 * via `useActionState`. Subject is sourced from the `Subject` master table,
 * Classroom from the current academic year. Teachers see only their homerooms;
 * admins see all classrooms.
 */

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Save, Loader2, BookOpenText } from 'lucide-react';
import {
  createHomework,
  updateHomework,
  type ActionState,
} from '@/app/(app)/homework/_actions';
import type {
  ClassroomOption,
  SubjectOption,
} from '@/lib/queries/homework';

type Mode = 'new' | 'edit';

type Initial = {
  classroomId: string;
  subjectId: string;
  title: string;
  description: string | null;
  dueDate: string; // yyyy-mm-dd
  attachmentUrl: string | null;
};

type Props = {
  mode: Mode;
  homeworkId?: string;
  subjects: SubjectOption[];
  classrooms: ClassroomOption[];
  initial?: Initial;
};

const blank: Initial = {
  classroomId: '',
  subjectId: '',
  title: '',
  description: '',
  dueDate: '',
  attachmentUrl: '',
};

export function HomeworkForm({
  mode,
  homeworkId,
  subjects,
  classrooms,
  initial,
}: Props) {
  const router = useRouter();
  const seed = initial ?? blank;

  const boundAction =
    mode === 'edit' && homeworkId
      ? updateHomework.bind(null, homeworkId)
      : createHomework;

  const [state, formAction] = useActionState<ActionState | undefined, FormData>(
    boundAction,
    undefined,
  );

  const errs = !state || state.ok ? {} : state.fieldErrors ?? {};
  const topError = state && !state.ok ? state.error : null;

  return (
    <form action={formAction} className="space-y-6">
      {topError && (
        <div className="rounded-md border border-danger/30 bg-danger-soft px-4 py-3 text-[13px] text-danger">
          {topError}
        </div>
      )}

      <Section
        title="Classroom & subject"
        eyebrow="Where & what"
        Icon={BookOpenText}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Classroom" error={errs.classroomId}>
            <select
              name="classroomId"
              defaultValue={seed.classroomId}
              className="block w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-ink focus:bg-surface transition-colors"
              required
            >
              <option value="" disabled>
                Pick a classroom
              </option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {humanProgram(c.programKind)}
                </option>
              ))}
            </select>
            {classrooms.length === 0 && (
              <p className="mt-1 text-[11.5px] text-ink-faint italic">
                No classrooms available to you.
              </p>
            )}
          </Field>

          <Field label="Subject" error={errs.subjectId}>
            <select
              name="subjectId"
              defaultValue={seed.subjectId}
              className="block w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-ink focus:bg-surface transition-colors"
              required
            >
              <option value="" disabled>
                Pick a subject
              </option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Assignment" eyebrow="What students need to do">
        <Field label="Title" error={errs.title}>
          <input
            type="text"
            name="title"
            defaultValue={seed.title}
            placeholder="Chapter 4 word problems"
            className="block w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-ink focus:bg-surface transition-colors"
            maxLength={160}
            required
          />
        </Field>

        <Field
          label="Description (optional)"
          hint="Step-by-step instructions, pages, page numbers"
          error={errs.description}
        >
          <textarea
            name="description"
            defaultValue={seed.description ?? ''}
            rows={6}
            className="block w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-ink focus:bg-surface transition-colors leading-relaxed"
            maxLength={4000}
            placeholder="Complete exercises 1–10 from page 42. Write each problem in your notebook before solving."
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Due date" error={errs.dueDate}>
            <input
              type="date"
              name="dueDate"
              defaultValue={seed.dueDate}
              className="block w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-ink focus:bg-surface transition-colors tabular"
              required
            />
          </Field>
          <Field
            label="Attachment URL (optional)"
            hint="Paste a link to a worksheet or upload later"
            error={errs.attachmentUrl}
          >
            <input
              type="url"
              name="attachmentUrl"
              defaultValue={seed.attachmentUrl ?? ''}
              placeholder="https://drive.google.com/…"
              className="block w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-ink focus:bg-surface transition-colors"
              maxLength={500}
            />
          </Field>
        </div>
      </Section>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
        >
          Cancel
        </button>
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}

function SubmitButton({ mode }: { mode: Mode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.25} />
      ) : (
        <Save className="w-3.5 h-3.5" strokeWidth={2.25} />
      )}
      {mode === 'edit' ? 'Save changes' : 'Post homework'}
    </button>
  );
}

function Section({
  title,
  eyebrow,
  Icon,
  children,
}: {
  title: string;
  eyebrow?: string;
  Icon?: typeof BookOpenText;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface border border-line rounded-lg p-5 space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          {eyebrow && <p className="eyebrow text-ink-faint">{eyebrow}</p>}
          <h2
            className="font-display text-lg text-ink"
            style={{ fontVariationSettings: '"opsz" 24' }}
          >
            {title}
          </h2>
        </div>
        {Icon && <Icon className="w-4 h-4 text-accent" strokeWidth={1.5} />}
      </header>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-[12px] font-semibold text-ink-soft">{label}</span>
      {children}
      {hint && !error && (
        <span className="block text-[11px] text-ink-faint">{hint}</span>
      )}
      {error && (
        <span className="block text-[11.5px] font-semibold text-danger">
          {error}
        </span>
      )}
    </label>
  );
}

function humanProgram(p: string): string {
  return (
    {
      NURSERY: 'Nursery',
      MONTESSORI: 'Montessori',
      KINDERGARTEN: 'Kindergarten',
      PRIMARY: 'Primary',
      EVENING_COACHING: 'Evening coaching',
      SATURDAY_COACHING: 'Saturday coaching',
      COMPUTER_COURSE: 'Computer course',
    }[p] ?? p
  );
}
