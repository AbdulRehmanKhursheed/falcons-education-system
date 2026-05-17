'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import { createTeacher } from '@/app/(app)/teachers/_actions';

export function TeacherCreateForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setFieldErrors({});
    setFormError(null);
    startTransition(async () => {
      const result = await createTeacher(formData);
      if (result.ok && result.teacherId) {
        router.push(`/teachers/${result.teacherId}`);
        router.refresh();
        return;
      }
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      if (result.error) setFormError(result.error);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-line rounded-lg p-6 max-w-2xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field
          label="Full name"
          name="name"
          required
          autoComplete="name"
          error={fieldErrors.name}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          error={fieldErrors.email}
        />
        <Field
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+92 311 9911288"
          error={fieldErrors.phone}
        />
        <Field
          label="Qualification"
          name="qualification"
          placeholder="MA Education · 6 yrs"
          error={fieldErrors.qualification}
        />
        <Field
          label="Temporary password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          hint="At least 8 characters. They can change it after first login."
          error={fieldErrors.password}
          className="sm:col-span-2"
        />
      </div>

      {formError && (
        <p className="mt-5 text-[12.5px] text-danger" role="alert">
          {formError}
        </p>
      )}

      <div className="mt-6 pt-5 border-t border-line-soft flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.25} />
          ) : (
            <UserPlus className="w-3.5 h-3.5" strokeWidth={2.25} />
          )}
          Create teacher
        </button>
        <button
          type="button"
          onClick={() => router.push('/teachers')}
          className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required = false,
  autoComplete,
  placeholder,
  hint,
  error,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  className?: string;
}) {
  return (
    <label className={className ?? ''}>
      <span className="eyebrow text-ink-faint block mb-1.5">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-md border border-line bg-surface-2 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink focus:bg-surface transition-colors"
        aria-invalid={Boolean(error)}
      />
      {hint && !error && (
        <p className="mt-1 text-[11.5px] text-ink-faint">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-[11.5px] text-danger" role="alert">
          {error}
        </p>
      )}
    </label>
  );
}
