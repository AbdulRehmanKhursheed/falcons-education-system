'use client';

import { Printer } from 'lucide-react';

/**
 * Generic "Print this page" button. Used by the dedicated print routes
 * (/students/[id]/print, /attendance/print) so the page can auto-print as
 * well as offer a manual trigger.
 */
export function PrintTriggerButton({
  label = 'Print',
  variant = 'primary',
}: {
  label?: string;
  variant?: 'primary' | 'ghost';
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={
        variant === 'primary'
          ? 'inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors'
          : 'inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors'
      }
    >
      <Printer className="w-3.5 h-3.5" strokeWidth={2.25} />
      {label}
    </button>
  );
}
