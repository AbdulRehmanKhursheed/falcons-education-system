import { notFound } from 'next/navigation';
import { MessageCircle, Receipt } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { formatPKR, formatDate } from '@/lib/format';
import { requireRole } from '@/lib/auth-helpers';
import {
  assertOwnsStudent,
  getChildHeader,
  getChildInvoices,
} from '@/lib/queries/parent';
import { schoolProfile } from '@/lib/school-config';
import { ChildHeader } from '../_components/ChildHeader';

export const metadata = { title: 'Fees' };

const statusTone: Record<string, Parameters<typeof Chip>[0]['tone']> = {
  PAID: 'success',
  PARTIALLY_PAID: 'warn',
  ISSUED: 'info',
  OVERDUE: 'danger',
  DRAFT: 'neutral',
  CANCELLED: 'neutral',
};

const statusLabel: Record<string, string> = {
  PAID: 'Paid',
  PARTIALLY_PAID: 'Partially paid',
  ISSUED: 'Awaiting payment',
  OVERDUE: 'Overdue',
  DRAFT: 'Draft',
  CANCELLED: 'Cancelled',
};

const monthName = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function prettyMonth(key: string): string {
  const [y, m] = key.split('-').map(Number);
  if (!y || !m) return key;
  return `${monthName[m - 1]} ${y}`;
}

function whatsappPayHref(args: {
  invoiceNo: string;
  monthYear: string;
  due: number;
  total: number;
  studentName: string;
  rollNo: string;
}): string {
  const msg = `Hello Falcons office,

I'd like to pay the fee invoice ${args.invoiceNo} (${prettyMonth(args.monthYear)}) for ${args.studentName}, roll ${args.rollNo}.

Amount due: ${formatPKR(args.due)}
Invoice total: ${formatPKR(args.total)}

Please confirm payment details. Thank you.`;
  return `https://wa.me/${schoolProfile.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
}

export default async function ChildFeesPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const session = await requireRole(['PARENT']);
  const { studentId } = await params;
  await assertOwnsStudent(session.user.id, studentId);

  const [child, fees] = await Promise.all([
    getChildHeader(studentId),
    getChildInvoices(studentId),
  ]);
  if (!child) notFound();

  return (
    <>
      <ChildHeader child={child} activeTab="fees" />

      {/* Outstanding summary */}
      <Card className="mb-6">
        <CardHeader
          eyebrow="Account"
          title={
            fees.outstandingTotal > 0
              ? `${formatPKR(fees.outstandingTotal)} pending`
              : 'All paid up'
          }
          meta={
            fees.outstandingTotal > 0
              ? `Across ${fees.invoices.filter((i) => ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'].includes(i.status)).length} open invoice${
                  fees.invoices.filter((i) => ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'].includes(i.status)).length === 1 ? '' : 's'
                }`
              : 'Nothing due right now — thank you.'
          }
          action={<Receipt className="w-4 h-4 text-accent" strokeWidth={1.5} />}
        />
        {fees.outstandingTotal > 0 && (
          <div className="px-5 py-4 border-t border-line-soft bg-surface-2/60">
            <a
              href={whatsappPayHref({
                invoiceNo: '(open balance)',
                monthYear: '',
                due: fees.outstandingTotal,
                total: fees.outstandingTotal,
                studentName: child.fullName,
                rollNo: child.rollNo,
              })}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
              Pay {formatPKR(fees.outstandingTotal)} on WhatsApp
            </a>
            <p className="text-[11.5px] text-ink-muted mt-2">
              Send a quick message — the office will confirm payment options
              (bank, JazzCash, EasyPaisa) and mark the receipt against your
              account.
            </p>
          </div>
        )}
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader
          eyebrow="Invoices"
          title="All invoices"
          meta={`${fees.invoices.length} total`}
        />
        {fees.invoices.length === 0 ? (
          <div className="px-5 py-8 text-[13px] text-ink-muted italic">
            No invoices have been issued yet.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead className="bg-surface-2 border-b border-line-soft">
                  <tr className="text-left">
                    <th className="px-5 py-2.5 eyebrow text-ink-faint">Month</th>
                    <th className="px-5 py-2.5 eyebrow text-ink-faint">Invoice</th>
                    <th className="px-5 py-2.5 eyebrow text-ink-faint text-right">Total</th>
                    <th className="px-5 py-2.5 eyebrow text-ink-faint text-right">Paid</th>
                    <th className="px-5 py-2.5 eyebrow text-ink-faint text-right">Due</th>
                    <th className="px-5 py-2.5 eyebrow text-ink-faint">Status</th>
                    <th className="px-5 py-2.5 eyebrow text-ink-faint text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {fees.invoices.map((inv) => {
                    const payable = ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'].includes(inv.status);
                    return (
                      <tr key={inv.id} className="hover:bg-surface-2/60 transition-colors">
                        <td className="px-5 py-3">
                          <p className="text-ink font-semibold">{prettyMonth(inv.monthYear)}</p>
                          <p className="text-[10.5px] text-ink-faint mt-0.5">
                            Issued {formatDate(inv.issuedAt, { month: 'short', day: 'numeric' })}
                          </p>
                        </td>
                        <td className="px-5 py-3 text-ink-soft font-mono tabular text-[11.5px]">
                          {inv.invoiceNo}
                        </td>
                        <td className="px-5 py-3 text-right tabular text-ink">
                          {formatPKR(inv.total)}
                        </td>
                        <td className="px-5 py-3 text-right tabular text-ink-soft">
                          {formatPKR(inv.amountPaid)}
                        </td>
                        <td className="px-5 py-3 text-right tabular">
                          {inv.due > 0 ? (
                            <span className="text-danger font-semibold">{formatPKR(inv.due)}</span>
                          ) : (
                            <span className="text-ink-faint">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <Chip tone={statusTone[inv.status] ?? 'neutral'}>
                            {statusLabel[inv.status] ?? inv.status}
                          </Chip>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {payable ? (
                            <a
                              href={whatsappPayHref({
                                invoiceNo: inv.invoiceNo,
                                monthYear: inv.monthYear,
                                due: inv.due,
                                total: inv.total,
                                studentName: child.fullName,
                                rollNo: child.rollNo,
                              })}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-soft hover:text-ink"
                            >
                              <MessageCircle className="w-3 h-3" strokeWidth={2} />
                              Pay
                            </a>
                          ) : (
                            <span className="text-[11px] text-ink-faint">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="md:hidden divide-y divide-line-soft">
              {fees.invoices.map((inv) => {
                const payable = ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'].includes(inv.status);
                return (
                  <li key={inv.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-ink">
                          {prettyMonth(inv.monthYear)}
                        </p>
                        <p className="text-[10.5px] text-ink-faint font-mono">
                          {inv.invoiceNo}
                        </p>
                      </div>
                      <Chip tone={statusTone[inv.status] ?? 'neutral'}>
                        {statusLabel[inv.status] ?? inv.status}
                      </Chip>
                    </div>
                    <dl className="grid grid-cols-3 gap-2 text-[12px]">
                      <div>
                        <dt className="eyebrow text-ink-faint">Total</dt>
                        <dd className="text-ink tabular">{formatPKR(inv.total)}</dd>
                      </div>
                      <div>
                        <dt className="eyebrow text-ink-faint">Paid</dt>
                        <dd className="text-ink-soft tabular">{formatPKR(inv.amountPaid)}</dd>
                      </div>
                      <div>
                        <dt className="eyebrow text-ink-faint">Due</dt>
                        <dd className={`tabular ${inv.due > 0 ? 'text-danger font-semibold' : 'text-ink-faint'}`}>
                          {inv.due > 0 ? formatPKR(inv.due) : '—'}
                        </dd>
                      </div>
                    </dl>
                    {payable && (
                      <a
                        href={whatsappPayHref({
                          invoiceNo: inv.invoiceNo,
                          monthYear: inv.monthYear,
                          due: inv.due,
                          total: inv.total,
                          studentName: child.fullName,
                          rollNo: child.rollNo,
                        })}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[11.5px] font-semibold text-paper hover:bg-brand-dark transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" strokeWidth={2} />
                        Pay on WhatsApp
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Card>

      <p className="mt-6 text-[12px] text-ink-muted leading-relaxed">
        Need a printed receipt or fee challan? Send a quick WhatsApp to{' '}
        <a
          href={`https://wa.me/${schoolProfile.whatsapp.replace(/\D/g, '')}`}
          className="text-ink underline decoration-line decoration-1 underline-offset-[5px]"
          target="_blank"
          rel="noreferrer noopener"
        >
          {schoolProfile.whatsapp}
        </a>{' '}
        and the office will prepare it for you.
      </p>
    </>
  );
}
