'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Loader2, Save } from 'lucide-react';
import { updateTeacher } from '@/app/(app)/teachers/_actions';

type Props = {
  teacherId: string;
  initialQualification: string | null;
  initialActive: boolean;
};

export function TeacherEditForm({
  teacherId,
  initialQualification,
  initialActive,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState(initialActive);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('active', active ? 'true' : 'false');
    setFieldErrors({});
    startTransition(async () => {
      const result = await updateTeacher(teacherId, formData);
      if (result.ok) {
        setSavedAt(Date.now());
        router.refresh();
        return;
      }
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block">
        <span className="eyebrow text-ink-faint block mb-1.5">Qualification</span>
        <input
          name="qualification"
          type="text"
          defaultValue={initialQualification ?? ''}
          placeholder="MA Education · 6 yrs"
          className="w-full px-3 py-2 rounded-md border border-line bg-surface-2 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink focus:bg-surface transition-colors"
          aria-invalid={Boolean(fieldErrors.qualification)}
        />
        {fieldErrors.qualification && (
          <p className="mt-1 text-[11.5px] text-danger" role="alert">
            {fieldErrors.qualification}
          </p>
        )}
      </label>

      <div>
        <span className="eyebrow text-ink-faint block mb-2">Account status</span>
        <button
          type="button"
          onClick={() => setActive((a) => !a)}
          aria-pressed={active}
          className="inline-flex items-center gap-2 rounded-md border border-line bg-surface-2 px-3 py-1.5 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
        >
          <span
            aria-hidden
            className={
              'inline-block w-2 h-2 rounded-full ' +
              (active ? 'bg-success' : 'bg-ink-faint')
            }
          />
          {active ? 'Active' : 'Inactive'}
        </button>
        <p className="mt-2 text-[11.5px] text-ink-faint">
          Deactivating blocks portal login for this teacher.
        </p>
      </div>

      <div className="pt-4 border-t border-line-soft flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.25} />
          ) : (
            <Save className="w-3.5 h-3.5" strokeWidth={2.25} />
          )}
          Save changes
        </button>
        {savedAt && !isPending && (
          <span className="text-[11.5px] text-success font-semibold">
            Saved
          </span>
        )}
      </div>
    </form>
  );
}
