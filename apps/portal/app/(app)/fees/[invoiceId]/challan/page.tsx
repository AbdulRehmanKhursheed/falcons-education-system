import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { PrintChallanButton } from '@/components/data/PrintChallanButton';
import { formatPKR, formatDate } from '@/lib/format';
import { getInvoiceDetail, type InvoiceDetail } from '@/lib/queries/fees';
import { requireRole } from '@/lib/auth-helpers';
import { schoolProfile, formatSchoolAddress } from '@/lib/school-config';
import type { InvoiceStatus } from '@prisma/client';

export const metadata = { title: 'Fee Challan' };

const statusLabel: Record<InvoiceStatus, string> = {
  DRAFT: 'Draft',
  ISSUED: 'Issued',
  PARTIALLY_PAID: 'Partially paid',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled',
};

function formatMonth(monthYear: string) {
  const [y, m] = monthYear.split('-').map(Number);
  if (!y || !m) return monthYear;
  return new Date(y, m - 1, 1).toLocaleDateString('en-PK', {
    month: 'long',
    year: 'numeric',
  });
}

export default async function ChallanPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT']);

  const invoice = await getInvoiceDetail(invoiceId);
  if (!invoice) notFound();

  const lateFee = 0; // Phase 3 — could be derived from overdue days.
  const grandTotal = invoice.total + lateFee;

  return (
    <>
      {/* Print-only CSS — hides the portal chrome (sidebar + top bar)
         and switches to an A4-friendly layout. Inline so we don't have
         to touch globals.css. */}
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          html, body { background: #ffffff !important; }
          /* Hide portal chrome */
          aside, header.sticky, .no-print { display: none !important; }
          /* Reset the app's main padding so the challan fills the page */
          main { padding: 0 !important; }
          .challan-page {
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
            max-width: 100% !important;
            padding: 0 !important;
          }
          .challan-copy {
            page-break-inside: avoid;
          }
          .challan-copy + .challan-copy {
            margin-top: 10mm !important;
            border-top: 1px dashed #000 !important;
            padding-top: 8mm !important;
          }
        }
      `}</style>

      {/* On-screen toolbar — hidden in print */}
      <div className="no-print mb-6 flex items-center justify-between gap-3">
        <Link
          href={`/fees/${invoice.id}`}
          className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
          Back to invoice
        </Link>
        <PrintChallanButton />
      </div>

      <div className="challan-page bg-paper border border-line rounded-lg p-8 sm:p-10 max-w-3xl mx-auto">
        <ChallanCopy
          copyLabel="Office Copy"
          invoice={invoice}
          lateFee={lateFee}
          grandTotal={grandTotal}
        />
        <div className="my-8 border-t border-dashed border-line-strong" />
        <ChallanCopy
          copyLabel="Parent Copy"
          invoice={invoice}
          lateFee={lateFee}
          grandTotal={grandTotal}
        />
      </div>
    </>
  );
}

function ChallanCopy({
  copyLabel,
  invoice,
  lateFee,
  grandTotal,
}: {
  copyLabel: string;
  invoice: InvoiceDetail;
  lateFee: number;
  grandTotal: number;
}) {
  return (
    <section className="challan-copy">
      {/* Header */}
      <header className="flex items-start justify-between gap-6 pb-5 border-b border-line-strong">
        <div className="flex items-start gap-3 min-w-0">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-ink text-paper shrink-0">
            <GraduationCap className="w-6 h-6" strokeWidth={1.5} />
          </span>
          <div className="min-w-0">
            <h1
              className="font-display text-2xl text-ink leading-tight"
              style={{ fontVariationSettings: '"opsz" 48' }}
            >
              {schoolProfile.name}
            </h1>
            <p className="text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint mt-1">
              {schoolProfile.tagline}
            </p>
            <p className="text-[12px] text-ink-muted mt-2">
              {formatSchoolAddress(schoolProfile)} · {schoolProfile.phone}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="eyebrow text-ink-faint">{copyLabel}</p>
          <p
            className="mt-1 font-display text-xl text-ink leading-tight"
            style={{ fontVariationSettings: '"opsz" 24' }}
          >
            Fee Challan
          </p>
          <p className="text-[12px] text-ink-muted mt-1 tabular">
            {invoice.invoiceNo}
          </p>
        </div>
      </header>

      {/* Student + invoice meta */}
      <div className="grid grid-cols-2 gap-6 py-5 border-b border-line-soft text-[12.5px]">
        <div>
          <p className="eyebrow text-ink-faint mb-2">Student</p>
          <dl className="space-y-1">
            <MetaRow label="Name" value={invoice.student.fullName} />
            <MetaRow label="Roll no" value={invoice.student.rollNo} mono />
            <MetaRow label="Class" value={invoice.student.classroom} />
            {invoice.guardian && (
              <>
                <MetaRow
                  label={invoice.guardian.relation}
                  value={invoice.guardian.fullName}
                />
                <MetaRow label="Phone" value={invoice.guardian.phone} mono />
              </>
            )}
          </dl>
        </div>
        <div>
          <p className="eyebrow text-ink-faint mb-2">Invoice</p>
          <dl className="space-y-1">
            <MetaRow label="Invoice no" value={invoice.invoiceNo} mono />
            <MetaRow label="Issued" value={formatDate(invoice.issuedAt)} />
            <MetaRow label="Month" value={formatMonth(invoice.monthYear)} />
            <MetaRow label="Due date" value={formatDate(invoice.dueDate)} />
            <MetaRow label="Status" value={statusLabel[invoice.status]} />
          </dl>
        </div>
      </div>

      {/* Amount table */}
      <table className="w-full text-[13px] my-5 border border-line-soft">
        <thead>
          <tr className="bg-surface-2 border-b border-line-soft">
            <th className="px-3 py-2.5 text-left eyebrow text-ink-faint font-semibold">
              Description
            </th>
            <th className="px-3 py-2.5 text-right eyebrow text-ink-faint font-semibold">
              Amount (PKR)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft">
          <tr>
            <td className="px-3 py-2.5 text-ink">
              {invoice.feeStructureName ?? 'Tuition fee'}
              <span className="text-ink-muted">
                {' '}· {formatMonth(invoice.monthYear)}
              </span>
            </td>
            <td className="px-3 py-2.5 text-right tabular text-ink">
              {formatPKR(invoice.amount)}
            </td>
          </tr>
          {invoice.discount > 0 && (
            <tr>
              <td className="px-3 py-2.5 text-ink-soft">Discount</td>
              <td className="px-3 py-2.5 text-right tabular text-ink-soft">
                − {formatPKR(invoice.discount)}
              </td>
            </tr>
          )}
          {lateFee > 0 && (
            <tr>
              <td className="px-3 py-2.5 text-danger">Late fee</td>
              <td className="px-3 py-2.5 text-right tabular text-danger">
                + {formatPKR(lateFee)}
              </td>
            </tr>
          )}
          {invoice.amountPaid > 0 && (
            <tr>
              <td className="px-3 py-2.5 text-success">Paid to date</td>
              <td className="px-3 py-2.5 text-right tabular text-success">
                − {formatPKR(invoice.amountPaid)}
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="bg-surface-2 border-t border-line-strong">
            <td className="px-3 py-3 font-semibold text-ink">Payable now</td>
            <td className="px-3 py-3 text-right tabular font-display text-lg text-ink">
              {formatPKR(Math.max(0, grandTotal - invoice.amountPaid))}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Payment instructions */}
      <div className="grid grid-cols-2 gap-6 text-[11.5px] text-ink-soft py-3 border-y border-line-soft">
        <div>
          <p className="eyebrow text-ink-faint mb-1.5">Payment methods</p>
          <ul className="space-y-0.5">
            <li>· Cash — at the school office</li>
            <li>· Bank transfer — account on request</li>
            <li>· JazzCash / EasyPaisa to {schoolProfile.phone}</li>
          </ul>
        </div>
        <div>
          <p className="eyebrow text-ink-faint mb-1.5">Terms</p>
          <ul className="space-y-0.5">
            <li>· Fees due by the 10th of each month.</li>
            <li>· Late payment may incur a fine after due date.</li>
            <li>· Receipts will be issued for every payment.</li>
          </ul>
        </div>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-10 pt-10 text-[11.5px]">
        <div>
          <div className="h-px bg-ink-faint mb-2" />
          <p className="eyebrow text-ink-faint">Parent / Guardian signature</p>
        </div>
        <div>
          <div className="h-px bg-ink-faint mb-2" />
          <p className="eyebrow text-ink-faint">Office stamp · received</p>
        </div>
      </div>

      <footer className="mt-6 pt-3 border-t border-line-soft flex items-center justify-between text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
        <span>
          {schoolProfile.name} · {schoolProfile.email}
        </span>
        <span className="tabular">
          Printed {formatDate(new Date().toISOString())}
        </span>
      </footer>
    </section>
  );
}

function MetaRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="w-20 shrink-0 text-ink-faint">{label}</dt>
      <dd
        className={
          mono ? 'font-mono tabular text-[12px] text-ink' : 'text-ink'
        }
      >
        {value}
      </dd>
    </div>
  );
}
