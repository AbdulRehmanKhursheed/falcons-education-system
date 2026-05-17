'use client';

/**
 * New / edit form for an Assessment.
 *
 * The shape diverges sharply between MONTESSORI_OBSERVATION (qualitative) and
 * PRIMARY_GRADE (quantitative). We render both modes from one form with a
 * tab selector at the top. The hidden `kind` input is updated when the tab
 * changes so the server action sees the correct discriminator.
 *
 * The student picker uses an <input list> with a <datalist> — we have ~30
 * students in seed data so the full list is cheap to ship; pickers can swap
 * to a server-search variant later without changing the action contract.
 */

import { useActionState, useEffect, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Sparkles, GraduationCap, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  montessoriAreas,
  primarySubjects,
  primaryGrades,
  deriveGrade,
} from '@/lib/schemas/assessments';
import {
  createAssessment,
  updateAssessment,
  type ActionState,
} from '@/app/(app)/assessments/_actions';
import type { PickerStudent } from '@/lib/queries/assessments';

type Mode = 'new' | 'edit';
type Kind = 'MONTESSORI_OBSERVATION' | 'PRIMARY_GRADE';

type Initial = {
  kind: Kind;
  studentId: string;
  studentLabel: string; // pre-resolved "Name · Roll" for edit mode
  area: string | null;
  milestone: string | null;
  subject: string | null;
  term: string | null;
  score: number | null;
  scoreMax: number | null;
  grade: string | null;
  notes: string | null;
};

type Props = {
  mode: Mode;
  assessmentId?: string;
  earlyYearsStudents: PickerStudent[];
  primaryStudents: PickerStudent[];
  initial?: Initial;
  defaultTerm: string;
};

const blank: Initial = {
  kind: 'MONTESSORI_OBSERVATION',
  studentId: '',
  studentLabel: '',
  area: null,
  milestone: null,
  subject: null,
  term: null,
  score: null,
  scoreMax: null,
  grade: null,
  notes: null,
};

export function AssessmentForm({
  mode,
  assessmentId,
  earlyYearsStudents,
  primaryStudents,
  initial,
  defaultTerm,
}: Props) {
  const router = useRouter();
  const seed = initial ?? blank;
  const [kind, setKind] = useState<Kind>(seed.kind);

  // Bind the action: server actions use `useActionState` to surface errors.
  const boundAction =
    mode === 'edit' && assessmentId
      ? updateAssessment.bind(null, assessmentId)
      : createAssessment;

  const [state, formAction] = useActionState<ActionState | undefined, FormData>(
    boundAction,
    undefined,
  );

  // After a successful update, refresh the page data and stay on detail.
  useEffect(() => {
    if (state?.ok && mode === 'edit') {
      router.refresh();
    }
  }, [state, mode, router]);

  const errs = !state || state.ok ? {} : state.fieldErrors ?? {};
  const topError = state && !state.ok ? state.error : null;

  // Student picker — combined option list keyed by displayLabel
  const allStudents = useMemo(() => {
    const m = new Map<string, PickerStudent>();
    for (const s of earlyYearsStudents) m.set(s.id, s);
    for (const s of primaryStudents) m.set(s.id, s);
    return Array.from(m.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [earlyYearsStudents, primaryStudents]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="kind" value={kind} />

      {/* Mode toggle */}
      <div className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface p-1">
        <ModeTab
          active={kind === 'MONTESSORI_OBSERVATION'}
          onClick={() => setKind('MONTESSORI_OBSERVATION')}
          Icon={Sparkles}
          label="Montessori observation"
        />
        <ModeTab
          active={kind === 'PRIMARY_GRADE'}
          onClick={() => setKind('PRIMARY_GRADE')}
          Icon={GraduationCap}
          label="Primary grade"
        />
      </div>

      {topError && (
        <div className="rounded-md border border-danger/30 bg-danger-soft px-4 py-3 text-[13px] text-danger">
          {topError}
        </div>
      )}

      {/* Student */}
      <Section title="Student" eyebrow="Who is this for">
        <StudentPicker
          students={kind === 'MONTESSORI_OBSERVATION' ? earlyYearsStudents : primaryStudents}
          fallbackStudents={allStudents}
          defaultId={seed.studentId}
          defaultLabel={seed.studentLabel}
          error={errs.studentId}
        />
      </Section>

      {/* Mode-specific fields */}
      {kind === 'MONTESSORI_OBSERVATION' ? (
        <Section title="Observation" eyebrow="Qualitative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Area" error={errs.area}>
              <select
                name="area"
                defaultValue={seed.area ?? ''}
                className="block w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-ink focus:bg-surface transition-colors"
                required
              >
                <option value="" disabled>
                  Pick an area
                </option>
                {montessoriAreas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Term (optional)" hint="e.g. Term 1 · 2026" error={errs.term}>
              <input
                type="text"
                name="term"
                defaultValue={seed.term ?? ''}
                placeholder={defaultTerm}
                className="block w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-ink focus:bg-surface transition-colors"
                maxLength={60}
              />
            </Field>
          </div>

          <Field label="Milestone" error={errs.milestone}>
            <input
              type="text"
              name="milestone"
              defaultValue={seed.milestone ?? ''}
              placeholder="Independently pours water without spilling"
              className="block w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-ink focus:bg-surface transition-colors"
              required
              maxLength={240}
            />
          </Field>

          <Field
            label="Notes (optional)"
            hint="Context, environment, what supported the learning"
            error={errs.notes}
          >
            <textarea
              name="notes"
              defaultValue={seed.notes ?? ''}
              rows={4}
              className="block w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-ink focus:bg-surface transition-colors"
              maxLength={2000}
            />
          </Field>
        </Section>
      ) : (
        <Section title="Grade" eyebrow="Quantitative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Subject" error={errs.subject}>
              <select
                name="subject"
                defaultValue={seed.subject ?? ''}
                className="block w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-ink focus:bg-surface transition-colors"
                required
              >
                <option value="" disabled>
                  Pick a subject
                </option>
                {primarySubjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Term" error={errs.term}>
              <input
                type="text"
                name="term"
                defaultValue={seed.term ?? defaultTerm}
                placeholder={defaultTerm}
                className="block w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-ink focus:bg-surface transition-colors"
                required
                maxLength={60}
              />
            </Field>
          </div>

          <GradeInputs
            defaultScore={seed.score ?? undefined}
            defaultMax={seed.scoreMax ?? undefined}
            defaultGrade={seed.grade ?? undefined}
            errs={errs}
          />

          <Field label="Notes (optional)" error={errs.notes}>
            <textarea
              name="notes"
              defaultValue={seed.notes ?? ''}
              rows={3}
              className="block w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-ink focus:bg-surface transition-colors"
              maxLength={2000}
            />
          </Field>
        </Section>
      )}

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
      {mode === 'edit' ? 'Save changes' : 'Save assessment'}
    </button>
  );
}

function ModeTab({
  active,
  onClick,
  Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  Icon: typeof Sparkles;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-[12.5px] font-semibold transition-colors',
        active
          ? 'bg-ink text-paper'
          : 'text-ink-soft hover:bg-surface-3 hover:text-ink',
      )}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2} />
      {label}
    </button>
  );
}

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface border border-line rounded-lg p-5 space-y-4">
      <header>
        {eyebrow && <p className="eyebrow text-ink-faint">{eyebrow}</p>}
        <h2
          className="font-display text-lg text-ink"
          style={{ fontVariationSettings: '"opsz" 24' }}
        >
          {title}
        </h2>
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
      <span className="block text-[12px] font-semibold text-ink-soft">
        {label}
      </span>
      {children}
      {hint && !error && <span className="block text-[11px] text-ink-faint">{hint}</span>}
      {error && (
        <span className="block text-[11.5px] font-semibold text-danger">
          {error}
        </span>
      )}
    </label>
  );
}

function StudentPicker({
  students,
  fallbackStudents,
  defaultId,
  defaultLabel,
  error,
}: {
  students: PickerStudent[];
  fallbackStudents: PickerStudent[];
  defaultId: string;
  defaultLabel: string;
  error?: string;
}) {
  // Build a "Name · Roll" label keyed to id so the input list resolves to id.
  const list = students.length > 0 ? students : fallbackStudents;
  const [label, setLabel] = useState(defaultLabel);
  const [studentId, setStudentId] = useState(defaultId);

  function handleChange(value: string) {
    setLabel(value);
    const match = list.find(
      (s) => `${s.name} · ${s.rollNo}` === value || s.rollNo === value || s.name === value,
    );
    setStudentId(match?.id ?? '');
  }

  return (
    <Field
      label="Student"
      hint="Start typing a name or roll number"
      error={error}
    >
      <input
        type="text"
        list="assessment-student-list"
        value={label}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Ali Hassan · F-101"
        autoComplete="off"
        className="block w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-ink focus:bg-surface transition-colors"
        required
      />
      <datalist id="assessment-student-list">
        {list.map((s) => (
          <option
            key={s.id}
            value={`${s.name} · ${s.rollNo}`}
            label={s.classroom ?? undefined}
          />
        ))}
      </datalist>
      <input type="hidden" name="studentId" value={studentId} />
    </Field>
  );
}

function GradeInputs({
  defaultScore,
  defaultMax,
  defaultGrade,
  errs,
}: {
  defaultScore?: number;
  defaultMax?: number;
  defaultGrade?: string;
  errs: Record<string, string>;
}) {
  const [score, setScore] = useState<string>(defaultScore?.toString() ?? '');
  const [scoreMax, setScoreMax] = useState<string>(defaultMax?.toString() ?? '100');
  const [grade, setGrade] = useState<string>(defaultGrade ?? '');
  const [gradeOverridden, setGradeOverridden] = useState<boolean>(!!defaultGrade);

  // Recompute grade whenever score/max change, unless user has overridden.
  useEffect(() => {
    if (gradeOverridden) return;
    const s = Number(score);
    const m = Number(scoreMax);
    if (Number.isFinite(s) && Number.isFinite(m) && m > 0 && score !== '' && scoreMax !== '') {
      setGrade(deriveGrade(s, m));
    } else {
      setGrade('');
    }
  }, [score, scoreMax, gradeOverridden]);

  const pct =
    score !== '' && scoreMax !== '' && Number(scoreMax) > 0
      ? Math.round((Number(score) / Number(scoreMax)) * 1000) / 10
      : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Field label="Score" error={errs.score}>
        <input
          type="number"
          name="score"
          step="0.5"
          min={0}
          max={1000}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="block w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-ink focus:bg-surface transition-colors tabular"
          required
        />
      </Field>
      <Field label="Out of" error={errs.scoreMax}>
        <input
          type="number"
          name="scoreMax"
          step="1"
          min={1}
          max={1000}
          value={scoreMax}
          onChange={(e) => setScoreMax(e.target.value)}
          className="block w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-ink focus:bg-surface transition-colors tabular"
          required
        />
      </Field>
      <Field
        label={`Grade${pct !== null ? ` · ${pct.toFixed(1)}%` : ''}`}
        hint={gradeOverridden ? 'Override active — reset by changing score' : 'Auto-derived. You can override.'}
        error={errs.grade}
      >
        <select
          name="grade"
          value={grade}
          onChange={(e) => {
            setGrade(e.target.value);
            setGradeOverridden(true);
          }}
          className="block w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-ink focus:bg-surface transition-colors"
        >
          <option value="">—</option>
          {primaryGrades.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}
