'use client';

import { useState, useTransition } from 'react';
import { Loader2, Percent, Ban } from 'lucide-react';
import { applyDiscount, cancelInvoice } from '@/app/(app)/fees/_actions';

type Props = {
  invoiceId: string;
  currentDiscount: number;
  canCancel: boolean;
  status: string;
};

export function InvoiceAdminActions({
  invoiceId,
  currentDiscount,
  canCancel,
  status,
}: Props) {
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discount, setDiscount] = useState<string>(String(currentDiscount));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isCancelled = status === 'CANCELLED';

  function handleApply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const value = Number(discount);
    if (!Number.isFinite(value) || value < 0) {
      setError('Enter a valid amount');
      return;
    }
    startTransition(async () => {
      const res = await applyDiscount({ invoiceId, discount: value });
      if (res.ok) {
        setDiscountOpen(false);
      } else {
        setError(res.error);
      }
    });
  }

  function handleCancel() {
    if (!confirm('Cancel this invoice? This action is logged in the audit trail.')) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await cancelInvoice(invoiceId);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div className="px-5 py-4 border-t border-line-soft space-y-3">
      {!discountOpen ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={pending || isCancelled}
            onClick={() => setDiscountOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5 text-[12px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors disabled:opacity-60"
          >
            <Percent className="w-3.5 h-3.5" strokeWidth={2} />
            Apply discount
          </button>
          {canCancel && (
            <button
              type="button"
              disabled={pending || !canCancel || isCancelled}
              onClick={handleCancel}
              className="inline-flex items-center gap-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-1.5 text-[12px] font-semibold text-danger hover:bg-danger hover:text-paper transition-colors disabled:opacity-60"
            >
              {pending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
              ) : (
                <Ban className="w-3.5 h-3.5" strokeWidth={2} />
              )}
              Cancel invoice
            </button>
          )}
          {error && (
            <span className="text-[11.5px] font-semibold text-danger">
              {error}
            </span>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleApply}
          className="flex flex-wrap items-end gap-2"
        >
          <label className="space-y-1.5">
            <span className="eyebrow text-ink-faint">Discount (PKR)</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-32 px-3 py-1.5 rounded-md border border-line bg-surface-2 text-[13px] tabular text-ink focus:outline-none focus:border-ink focus:bg-surface transition-colors"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-md bg-ink px-3 py-1.5 text-[12px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
            ) : (
              <Percent className="w-3.5 h-3.5" strokeWidth={2} />
            )}
            Apply
          </button>
          <button
            type="button"
            onClick={() => {
              setDiscountOpen(false);
              setError(null);
              setDiscount(String(currentDiscount));
            }}
            className="inline-flex items-center rounded-md border border-line bg-surface px-3 py-1.5 text-[12px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
          >
            Cancel
          </button>
          {error && (
            <span className="text-[11.5px] font-semibold text-danger">
              {error}
            </span>
          )}
        </form>
      )}
    </div>
  );
}
