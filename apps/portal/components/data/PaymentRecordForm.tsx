'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { recordPayment } from '@/app/(app)/fees/_actions';
import type { PaymentMethodInput } from '@/lib/schemas/fees';
import { formatPKR } from '@/lib/format';

type Props = {
  invoiceId: string;
  outstanding: number;
};

const methodOptions: Array<{ value: PaymentMethodInput; label: string }> = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
  { value: 'JAZZCASH', label: 'JazzCash' },
  { value: 'EASYPAISA', label: 'EasyPaisa' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'OTHER', label: 'Other' },
];

function nowLocalForInput() {
  // datetime-local wants 'YYYY-MM-DDTHH:mm' in local time, no TZ suffix.
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function PaymentRecordForm({ invoiceId, outstanding }: Props) {
  const [amount, setAmount] = useState<string>(String(outstanding > 0 ? outstanding : ''));
  const [method, setMethod] = useState<PaymentMethodInput>('CASH');
  const [reference, setReference] = useState('');
  const [paidAt, setPaidAt] = useState(nowLocalForInput());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const disabled = outstanding <= 0;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError('Enter a valid amount');
      return;
    }
    startTransition(async () => {
      const res = await recordPayment({
        invoiceId,
        amount: parsed,
        method,
        reference: reference || undefined,
        paidAt: paidAt || undefined,
        notes: notes || undefined,
      });
      if (res.ok) {
        setSuccess(`Recorded ${formatPKR(parsed)} payment.`);
        setReference('');
        setNotes('');
        // Reset paid-at to fresh now
        setPaidAt(nowLocalForInput());
        // Leave amount alone — page revalidates and the form re-renders
        // with the new outstanding via the server. But just in case it
        // stays mounted, clear amount.
        setAmount('');
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
      {disabled && (
        <p className="text-[12.5px] text-ink-muted italic">
          This invoice is fully settled — no further payments can be recorded.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="space-y-1.5">
          <span className="eyebrow text-ink-faint">Amount (PKR)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            disabled={disabled || pending}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-line bg-surface-2 text-[13px] tabular text-ink focus:outline-none focus:border-ink focus:bg-surface disabled:opacity-60 transition-colors"
            placeholder="0"
          />
        </label>

        <label className="space-y-1.5">
          <span className="eyebrow text-ink-faint">Method</span>
          <select
            value={method}
            disabled={disabled || pending}
            onChange={(e) => setMethod(e.target.value as PaymentMethodInput)}
            className="w-full px-3 py-2 rounded-md border border-line bg-surface-2 text-[13px] text-ink focus:outline-none focus:border-ink focus:bg-surface disabled:opacity-60 transition-colors"
          >
            {methodOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="eyebrow text-ink-faint">Reference</span>
          <input
            type="text"
            disabled={disabled || pending}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Txn id, cheque no, etc."
            className="w-full px-3 py-2 rounded-md border border-line bg-surface-2 text-[13px] text-ink focus:outline-none focus:border-ink focus:bg-surface disabled:opacity-60 transition-colors"
          />
        </label>

        <label className="space-y-1.5">
          <span className="eyebrow text-ink-faint">Paid at</span>
          <input
            type="datetime-local"
            disabled={disabled || pending}
            value={paidAt}
            onChange={(e) => setPaidAt(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-line bg-surface-2 text-[13px] tabular text-ink focus:outline-none focus:border-ink focus:bg-surface disabled:opacity-60 transition-colors"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="eyebrow text-ink-faint">Notes (optional)</span>
        <textarea
          rows={2}
          disabled={disabled || pending}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Sibling discount applied, partial cheque collected, etc."
          className="w-full px-3 py-2 rounded-md border border-line bg-surface-2 text-[13px] text-ink focus:outline-none focus:border-ink focus:bg-surface disabled:opacity-60 transition-colors"
        />
      </label>

      {error && (
        <p className="text-[12.5px] font-semibold text-danger">{error}</p>
      )}
      {success && (
        <p className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-success">
          <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
          {success}
        </p>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="submit"
          disabled={disabled || pending}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.25} />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.25} />
          )}
          Record payment
        </button>
      </div>
    </form>
  );
}
