import { PageHeader } from '@/components/layout/PageHeader';
import { ComingSoon } from '@/components/ui/ComingSoon';

export const metadata = { title: 'Fees · Invoices' };

export default function FeesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Section · 03 / Fees"
        title="Fees and invoices"
        description="Generate monthly challans, track payments, manage discounts, and send reminders."
      />
      <ComingSoon
        module="Fees"
        description="Monthly fee challans, payment tracking, discounts, sibling adjustments, and outstanding-dues reminders — all in one place."
        bullets={[
          'Fee structure per program (Nursery, Montessori, Class 1–6, Coaching)',
          'Auto-generate monthly invoices on a schedule',
          'Mark payment received (cash, bank transfer, JazzCash, EasyPaisa)',
          'Print or share PDF challan with parents on WhatsApp',
          'Sibling discount and scholarship handling',
          'Outstanding-dues report and automated reminder dispatch',
        ]}
      />
    </>
  );
}
