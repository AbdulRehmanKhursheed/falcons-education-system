import { PageHeader } from '@/components/layout/PageHeader';
import { ComingSoon } from '@/components/ui/ComingSoon';

export const metadata = { title: 'Attendance' };

export default function AttendancePage() {
  return (
    <>
      <PageHeader
        eyebrow="Section · 02 / Attendance"
        title="Attendance"
        description="Mark today's attendance, view classroom history, and notify parents of absences."
      />
      <ComingSoon
        module="Attendance"
        description="Daily attendance entry, classroom history, and automated parent notifications for absences and late arrivals."
        bullets={[
          'Per-classroom roster with one-tap mark present / absent / late',
          'Bulk attendance for assemblies and field days',
          'Auto WhatsApp notification to guardian on absence',
          'Monthly attendance % per student feeding into report cards',
          'Public holiday and school-closure calendar',
        ]}
      />
    </>
  );
}
