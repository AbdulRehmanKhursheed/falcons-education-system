'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Loader2, Save } from 'lucide-react';
import { updateGuardian } from '@/app/(app)/parents/_actions';

type Props = {
  guardianId: string;
  initial: {
    phone: string;
    whatsapp: string | null;
    email: string | null;
    occupation: string | null;
    address: string | null;
  };
};

export function ParentEditForm({ guardianId, initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setFieldErrors({});
    setFormError(null);
    startTransition(async () => {
      const result = await updateGuardian(guardianId, formData);
      if (result.ok) {
        setSavedAt(Date.now());
        router.refresh();
        return;
      }
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      if (result.error) setFormError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Field
        label="Phone"
        name="phone"
        type="tel"
        required
        autoComplete="tel"
        defaultValue={initial.phone}
        placeholder="+92 311 9911288"
        error={fieldErrors.phone}
      />
      <Field
        label="WhatsApp"
        name="whatsapp"
        type="tel"
        autoComplete="tel"
        defaultValue={initial.whatsapp ?? ''}
        placeholder="+92 311 9911288"
        error={fieldErrors.whatsapp}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={initial.email ?? ''}
        error={fieldErrors.email}
      />
      <Field
        label="Occupation"
        name="occupation"
        defaultValue={initial.occupation ?? ''}
        error={fieldErrors.occupation}
      />
      <Field
        label="Address"
        name="address"
        defaultValue={initial.address ?? ''}
        error={fieldErrors.address}
        className="sm:col-span-2"
      />

      {formError && (
        <p className="sm:col-span-2 text-[12.5px] text-danger" role="alert">
          {formError}
        </p>
      )}

      <div className="sm:col-span-2 pt-4 border-t border-line-soft flex items-center gap-3">
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
          <span className="text-[11.5px] text-success font-semibold">Saved</span>
        )}
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
  defaultValue,
  error,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  defaultValue?: string;
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
        defaultValue={defaultValue}
        className="w-full px-3 py-2 rounded-md border border-line bg-surface-2 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink focus:bg-surface transition-colors"
        aria-invalid={Boolean(error)}
      />
      {error && (
        <p className="mt-1 text-[11.5px] text-danger" role="alert">
          {error}
        </p>
      )}
    </label>
  );
}
