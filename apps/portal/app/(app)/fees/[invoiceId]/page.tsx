import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Printer,
  FileText,
  Wallet,
  CalendarClock,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import { PaymentRecordForm } from '@/components/data/PaymentRecordForm';
import { InvoiceAdminActions } from '@/components/data/InvoiceAdminActions';
import { formatPKR, formatDate } from '@/lib/format';
import { getInvoiceDetail } from '@/lib/queries/fees';
import { requireRole } from '@/lib/auth-helpers';
import type { InvoiceStatus, PaymentMethod } from '@prisma/client';

export const metadata = { title: 'Invoice' };

const statusTone: Record<
  InvoiceStatus,
  Parameters<typeof Chip>[0]['tone']
> = {
  DRAFT: 'neutral',
  ISSUED: 'info',
  PARTIALLY_PAID: 'warn',
  PAID: 'success',
  OVERDUE: 'danger',
  CANCELLED: 'neutral',
};

const statusLabel: Record<InvoiceStatus, string> = {
  DRAFT: 'Draft',
  ISSUED: 'Issued',
  PARTIALLY_PAID: 'Partially paid',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled',
};

const methodLabel: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank transfer',
  JAZZCASH: 'JazzCash',
  EASYPAISA: 'EasyPaisa',
  CHEQUE: 'Cheque',
  OTHER: 'Other',
};

function formatMonth(monthYear: string) {
  const [y, m] = monthYear.split('-').map(Number);
  if (!y || !m) return monthYear;
  return new Date(y, m - 1, 1).toLocaleDateString('en-PK', {
    month: 'long',
    year: 'numeric',
  });
}

function whatsappLink(
  whatsappOrPhone: string,
  invoiceNo: string,
  studentName: string,
  outstanding: number,
  dueDate: string,
  monthYear: string,
): string {
  // wa.me requires digits only, country code prefixed. Pakistan numbers
  // are commonly stored as +92XXXXXXXXXX or 03XXXXXXXXX.
  const digits = whatsappOrPhone.replace(/[^0-9]/g, '');
  const normalized = digits.startsWith('92')
    ? digits
    : digits.startsWith('0')
      ? `92${digits.slice(1)}`
      : digits;

  const message = [
    `Assalam o Alaikum,`,
    ``,
    `This is a friendly reminder from Falcons Education System.`,
    ``,
    `Invoice: ${invoiceNo}`,
    `Student: ${studentName}`,
    `Month: ${formatMonth(monthYear)}`,
    `Amount due: ${formatPKR(outstanding)}`,
    `Due date: ${formatDate(dueDate)}`,
    ``,
    `Kindly clear at your earliest convenience. Jazak'Allah.`,
  ].join('\n');

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  const session = await requireRole([
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'ACCOUNTANT',
  ]);

  const invoice = await getInvoiceDetail(invoiceId);
  if (!invoice) notFound();

  const canRecordPayment =
    session.user.role === 'SUPER_ADMIN' ||
    session.user.role === 'SCHOOL_ADMIN' ||
    session.user.role === 'ACCOUNTANT';
  const canAdminAction =
    session.user.role === 'SUPER_ADMIN' || session.user.role === 'SCHOOL_ADMIN';

  const isOverdue =
    invoice.status !== 'PAID' &&
    invoice.status !== 'CANCELLED' &&
    new Date(invoice.dueDate).getTime() < Date.now();

  const whatsappTarget =
    invoice.guardian?.whatsapp ?? invoice.guardian?.phone ?? null;

  return (
    <>
      <div className="mb-6 flex items-center gap-2 text-[12.5px] text-ink-muted">
        <Link
          href="/fees"
          className="inline-flex items-center gap-1.5 hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
          Back to invoices
        </Link>
      </div>

      <PageHeader
        eyebrow={`Invoice · ${invoice.invoiceNo}`}
        title={`${invoice.student.fullName}`}
        description={`${formatMonth(invoice.monthYear)} · ${invoice.student.classroom}`}
        actions={
          <>
            {whatsappTarget && invoice.outstanding > 0 && (
              <a
                href={whatsappLink(
                  whatsappTarget,
                  invoice.invoiceNo,
                  invoice.student.fullName,
                  invoice.outstanding,
                  invoice.dueDate,
                  invoice.monthYear,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
                WhatsApp reminder
              </a>
            )}
            <Link
              href={`/fees/${invoice.id}/challan`}
              className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors"
            >
              <Printer className="w-3.5 h-3.5" strokeWidth={2.25} />
              Print challan
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column — invoice meta + amount breakdown */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Student + guardian */}
          <Card>
            <CardHeader
              eyebrow="Student"
              title={invoice.student.fullName}
              meta={`Roll no · ${invoice.student.rollNo}`}
              action={<Chip tone={statusTone[invoice.status]}>{statusLabel[invoice.status]}</Chip>}
            />
            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Avatar name={invoice.student.fullName} size="lg" />
                <div className="min-w-0">
                  <p className="font-semibold text-ink truncate">
                    {invoice.student.fullName}
                  </p>
                  <p className="text-[12px] text-ink-muted truncate">
                    {invoice.student.classroom}
                  </p>
                </div>
              </div>
              {invoice.guardian ? (
                <div>
                  <p className="eyebrow text-ink-faint">
                    {invoice.guardian.relation} · Primary guardian
                  </p>
                  <p className="text-[13.5px] text-ink mt-1 font-medium">
                    {invoice.guardian.fullName}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[12.5px]">
                    <a
                      href={`tel:${invoice.guardian.phone}`}
                      className="inline-flex items-center gap-1.5 text-ink-soft hover:text-ink transition-colors font-mono tabular"
                    >
                      <Phone className="w-3 h-3" strokeWidth={1.75} />
                      {invoice.guardian.phone}
                    </a>
                    {invoice.guardian.whatsapp && (
                      <a
                        href={`https://wa.me/${invoice.guardian.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-success hover:text-success-soft transition-colors font-mono tabular"
                      >
                        <MessageCircle className="w-3 h-3" strokeWidth={1.75} />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-[12.5px] text-ink-faint italic">
                  No primary guardian on file.
                </p>
              )}
            </div>
          </Card>

          {/* Amount breakdown */}
          <Card>
            <CardHeader
              eyebrow="Amount"
              title="Breakdown"
              meta={
                invoice.feeStructureName
                  ? `${invoice.feeStructureName} · ${invoice.feeStructureFrequency ?? 'monthly'}`
                  : 'Ad-hoc invoice'
              }
              action={
                <Chip tone={isOverdue ? 'danger' : 'neutral'}>
                  {isOverdue ? 'Overdue' : `Due ${formatDate(invoice.dueDate, { month: 'short', day: 'numeric' })}`}
                </Chip>
              }
            />
            <dl className="px-5 py-4 divide-y divide-line-soft text-[13.5px]">
              <Row label="Invoice no">
                <span className="font-mono tabular text-ink">
                  {invoice.invoiceNo}
                </span>
              </Row>
              <Row label="Issued">
                <span className="tabular text-ink-soft">
                  {formatDate(invoice.issuedAt)}
                </span>
              </Row>
              <Row label="Due date">
                <span
                  className={
                    isOverdue
                      ? 'tabular text-danger font-semibold'
                      : 'tabular text-ink-soft'
                  }
                >
                  {formatDate(invoice.dueDate)}
                </span>
              </Row>
              <Row label="Amount">
                <span className="tabular text-ink-soft">
                  {formatPKR(invoice.amount)}
                </span>
              </Row>
              <Row label="Discount">
                <span className="tabular text-ink-soft">
                  {invoice.discount > 0 ? `− ${formatPKR(invoice.discount)}` : '—'}
                </span>
              </Row>
              <Row label="Total">
                <span className="tabular font-semibold text-ink">
                  {formatPKR(invoice.total)}
                </span>
              </Row>
              <Row label="Paid">
                <span className="tabular font-semibold text-success">
                  {invoice.amountPaid > 0 ? formatPKR(invoice.amountPaid) : '—'}
                </span>
              </Row>
              <Row label="Outstanding">
                <span
                  className={
                    invoice.outstanding > 0
                      ? 'tabular font-semibold text-danger'
                      : 'tabular font-semibold text-ink-faint'
                  }
                >
                  {invoice.outstanding > 0 ? formatPKR(invoice.outstanding) : 'Cleared'}
                </span>
              </Row>
            </dl>

            {canAdminAction && (
              <InvoiceAdminActions
                invoiceId={invoice.id}
                currentDiscount={invoice.discount}
                canCancel={canAdminAction}
                status={invoice.status}
              />
            )}
          </Card>

          {/* Payments list */}
          <Card>
            <CardHeader
              eyebrow="History"
              title="Payments"
              meta={`${invoice.payments.length} recorded`}
              action={
                <span className="text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint tabular">
                  {invoice.payments.length === 0 ? 'None yet' : `${invoice.payments.length}`}
                </span>
              }
            />
            {invoice.payments.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Wallet
                  className="w-6 h-6 mx-auto text-ink-faint"
                  strokeWidth={1.25}
                />
                <p
                  className="mt-3 font-display text-lg text-ink"
                  style={{ fontVariationSettings: '"opsz" 24' }}
                >
                  No payments recorded yet.
                </p>
                <p className="mt-1 text-[12.5px] text-ink-muted">
                  Use the form on the right to record the first payment.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead className="bg-surface-2 border-b border-line-soft">
                    <tr className="text-left">
                      {['Date', 'Method', 'Reference', 'Recorded by', 'Amount'].map(
                        (h, i) => (
                          <th
                            key={h}
                            className={`px-5 py-2.5 eyebrow text-ink-faint font-semibold whitespace-nowrap ${i === 4 ? 'text-right' : ''}`}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-soft">
                    {invoice.payments.map((p) => (
                      <tr key={p.id}>
                        <td className="px-5 py-2.5 text-ink-soft tabular">
                          {formatDate(p.paidAt, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-5 py-2.5 text-ink-soft">
                          {methodLabel[p.method]}
                        </td>
                        <td className="px-5 py-2.5 text-ink-faint font-mono text-[11.5px] tabular">
                          {p.reference ?? '—'}
                        </td>
                        <td className="px-5 py-2.5 text-ink-soft truncate max-w-[180px]">
                          {p.recordedBy}
                        </td>
                        <td className="px-5 py-2.5 text-right text-ink tabular font-semibold">
                          {formatPKR(p.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right column — record payment + quick info */}
        <div className="flex flex-col gap-4">
          {canRecordPayment && invoice.status !== 'CANCELLED' && (
            <Card>
              <CardHeader
                eyebrow="Receive"
                title="Record payment"
                meta={
                  invoice.outstanding > 0
                    ? `Outstanding · ${formatPKR(invoice.outstanding)}`
                    : 'Invoice fully settled'
                }
                action={<Wallet className="w-4 h-4 text-accent" strokeWidth={1.5} />}
              />
              <PaymentRecordForm
                invoiceId={invoice.id}
                outstanding={invoice.outstanding}
              />
            </Card>
          )}

          {invoice.status === 'CANCELLED' && (
            <Card className="bg-surface-2">
              <div className="px-5 py-4">
                <p className="eyebrow text-ink-faint">Invoice status</p>
                <p
                  className="mt-1 font-display text-xl text-ink"
                  style={{ fontVariationSettings: '"opsz" 24' }}
                >
                  Cancelled.
                </p>
                <p className="mt-1 text-[12.5px] text-ink-muted">
                  This invoice has been voided and is excluded from outstanding totals.
                </p>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader
              eyebrow="Quick info"
              title="At a glance"
              action={<FileText className="w-4 h-4 text-accent" strokeWidth={1.5} />}
            />
            <dl className="px-5 py-4 space-y-3 text-[13px]">
              <InfoRow label="Status" tone="status">
                <Chip tone={statusTone[invoice.status]}>{statusLabel[invoice.status]}</Chip>
              </InfoRow>
              <InfoRow label="Month" Icon={CalendarClock}>
                {formatMonth(invoice.monthYear)}
              </InfoRow>
              <InfoRow label="Total">
                <span className="tabular font-semibold">{formatPKR(invoice.total)}</span>
              </InfoRow>
              <InfoRow label="Outstanding">
                <span
                  className={
                    invoice.outstanding > 0
                      ? 'tabular font-semibold text-danger'
                      : 'tabular font-semibold text-ink-faint'
                  }
                >
                  {invoice.outstanding > 0 ? formatPKR(invoice.outstanding) : 'Cleared'}
                </span>
              </InfoRow>
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <dt className="eyebrow text-ink-faint">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

function InfoRow({
  label,
  children,
  Icon,
}: {
  label: string;
  children: React.ReactNode;
  Icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone?: 'status' | 'default';
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-2 eyebrow text-ink-faint">
        {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />}
        {label}
      </span>
      <span className="text-ink">{children}</span>
    </div>
  );
}
