'use client';

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteHomework } from '../_actions';

/**
 * Inline delete for the homework detail page. Native confirm + server action
 * — matches the pattern used by `AssessmentDeleteButton`.
 */
export function HomeworkDeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (typeof window === 'undefined') return;
    const ok = window.confirm(
      'Delete this homework post? Parents will no longer see it. This cannot be undone.',
    );
    if (!ok) return;
    startTransition(async () => {
      await deleteHomework(id);
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
