'use client';

/**
 * Admin-only delete control on the assessment detail page.
 * Confirms once with a native dialog, then calls the server action.
 */

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteAssessment } from '@/app/(app)/assessments/_actions';

export function AssessmentDeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (typeof window === 'undefined') return;
    const ok = window.confirm(
      'Delete this assessment? This action cannot be undone.',
    );
    if (!ok) return;
    startTransition(async () => {
      await deleteAssessment(id);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-md border border-danger/30 bg-danger-soft px-3.5 py-2 text-[12.5px] font-semibold text-danger hover:bg-danger hover:text-paper hover:border-danger transition-colors disabled:opacity-60"
    >
      <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
      {isPending ? 'Deleting…' : 'Delete'}
    </button>
  );
}
