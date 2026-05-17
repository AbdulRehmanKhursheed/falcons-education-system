import Link from 'next/link';
import {
  Receipt,
  Wallet,
  AlertCircle,
  FileText,
  Settings2,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { KPI } from '@/components/data/KPI';
import { InvoiceTable } from '@/components/data/InvoiceTable';
import { InvoiceGenerateButton } from '@/components/data/InvoiceGenerateButton';
import { formatPKR, formatNumber } from '@/lib/format';
import {
  getFeesKpis,
  getInvoices,
  getClassroomsForFilter,
  getMonthsForFilter,
} from '@/lib/queries/fees';
import { requireRole } from '@/lib/auth-helpers';

export const metadata = { title: 'Fees · Invoices' };

export default async function FeesPage() {
  const session = await requireRole([
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'ACCOUNTANT',
  ]);

  const [kpis, invoiceResult, classrooms, months] = await Promise.all([
    getFeesKpis(),
    getInvoices({ take: 100 }),
    getClassroomsForFilter(),
    getMonthsForFilter(),
  ]);

  const canGenerate =
    session.user.role === 'SUPER_ADMIN' ||
    session.user.role === 'SCHOOL_ADMIN' ||
    session.user.role === 'ACCOUNTANT';

  return (
    <>
      <PageHeader
        eyebrow="Section · 03 / Fees"
        title="Fees and invoices"
        description="Generate monthly challans, record payments, manage discounts, and send WhatsApp reminders."
        actions={
          <>
            <Link
              href="/fees/structures"
              className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5" strokeWidth={2} />
              Fee structures
            </Link>
            {canGenerate && <InvoiceGenerateButton />}
          </>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPI
          label="Collected this month"
          value={formatPKR(kpis.collectedThisMonth)}
          Icon={Wallet}
        />
        <KPI
          label="Outstanding total"
          value={formatPKR(kpis.outstandingTotal)}
          Icon={Receipt}
        />
        <KPI
          label="Overdue invoices"
          value={formatNumber(kpis.overdueCount)}
          Icon={AlertCircle}
        />
        <KPI
          label="Issued this month"
          value={formatNumber(kpis.issuedThisMonth)}
          Icon={FileText}
        />
      </div>

      <InvoiceTable
        initialRows={invoiceResult.rows}
        initialTotal={invoiceResult.total}
        classrooms={['All', ...classrooms.map((c) => c.name)]}
        months={months}
        initialStatus="all"
        initialClassroom="All"
        initialMonth="All"
        initialQuery=""
      />
    </>
  );
}
