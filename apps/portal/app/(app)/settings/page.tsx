import { PageHeader } from '@/components/layout/PageHeader';
import { ComingSoon } from '@/components/ui/ComingSoon';

export const metadata = { title: 'Settings' };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Section · 05 / Settings"
        title="Settings"
        description="School profile, academic year, fee structure, user management, and integrations."
      />
      <ComingSoon
        module="Settings"
        description="School-wide configuration. Most settings are role-restricted to School Admin and Super Admin."
        bullets={[
          'School profile (name, address, phone, logo, signatories)',
          'Academic year setup and term boundaries',
          'Fee structure templates per program',
          'User management — add staff, assign roles',
          'WhatsApp Business API integration for parent notifications',
          'Backup and export to CSV/Excel',
        ]}
      />
    </>
  );
}
