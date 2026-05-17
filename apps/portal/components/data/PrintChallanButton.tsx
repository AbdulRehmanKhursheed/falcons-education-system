'use client';

import { Printer } from 'lucide-react';

export function PrintChallanButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors"
    >
      <Printer className="w-3.5 h-3.5" strokeWidth={2.25} />
      Print
    </button>
  );
}
