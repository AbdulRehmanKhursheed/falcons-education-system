'use client';

import { useState, useTransition } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateMonthlyInvoices } from '@/app/(app)/fees/_actions';

export function InvoiceGenerateButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    kind: 'idle' | 'success' | 'error';
    message: string;
  }>({ kind: 'idle', message: '' });

  function handleClick() {
    setResult({ kind: 'idle', message: '' });
    startTransition(async () => {
      const res = await generateMonthlyInvoices();
      if (res.ok && res.data) {
        const { created, skipped, monthYear } = res.data;
        setResult({
          kind: 'success',
          message:
            created === 0
              ? `Up to date — all ${skipped} invoice(s) for ${monthYear} already exist.`
              : `Created ${created} invoice${created === 1 ? '' : 's'} for ${monthYear}${
                  skipped > 0 ? ` · ${skipped} skipped` : ''
                }.`,
        });
      } else if (!res.ok) {
        setResult({ kind: 'error', message: res.error });
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      {result.kind === 'success' && (
        <span className="text-[11.5px] font-semibold text-success">
          {result.message}
        </span>
      )}
      {result.kind === 'error' && (
        <span className="text-[11.5px] font-semibold text-danger">
          {result.message}
        </span>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.25} />
        ) : (
          <Sparkles className="w-3.5 h-3.5" strokeWidth={2.25} />
        )}
        Generate this month
      </button>
    </div>
  );
}
