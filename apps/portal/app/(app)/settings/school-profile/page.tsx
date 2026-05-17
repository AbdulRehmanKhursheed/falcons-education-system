import Link from 'next/link';
import { ArrowLeft, Info } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { requireRole } from '@/lib/auth-helpers';
import { schoolProfile, formatSchoolAddress } from '@/lib/school-config';

export const metadata = { title: 'School Profile · Settings' };

type Field = { label: string; value: string; mono?: boolean };

export default async function SchoolProfilePage() {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const fields: Field[] = [
    { label: 'Display name', value: schoolProfile.name },
    { label: 'Legal name', value: schoolProfile.legalName },
    { label: 'Tagline', value: schoolProfile.tagline },
    { label: 'Address', value: formatSchoolAddress() },
    { label: 'Phone', value: schoolProfile.phone, mono: true },
    { label: 'WhatsApp', value: schoolProfile.whatsapp, mono: true },
    { label: 'Email', value: schoolProfile.email, mono: true },
    { label: 'Website', value: schoolProfile.website, mono: true },
    { label: 'Principal', value: schoolProfile.principal },
    { label: 'Founded', value: String(schoolProfile.foundedYear) },
    { label: 'Reg / License no.', value: schoolProfile.licenseNo, mono: true },
    { label: 'Hours', value: schoolProfile.hours },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Settings · 01 / School Profile"
        title="School profile"
        description="Identity used by receipts, invoices, the parent portal header and the public marketing site."
        actions={
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            All settings
          </Link>
        }
      />

      <Card>
        <CardHeader
          eyebrow="Read-only"
          title="Identity"
          meta="Configured in lib/school-config.ts and shipped with each release."
        />
        <dl className="divide-y divide-line-soft">
          {fields.map((f) => (
            <div
              key={f.label}
              className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-2 sm:gap-6 px-5 py-3.5"
            >
              <dt className="text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
                {f.label}
              </dt>
              <dd
                className={
                  'text-[13.5px] text-ink ' +
                  (f.mono ? 'font-mono text-[12.5px]' : '')
                }
              >
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="px-5 py-4 border-t border-line-soft bg-surface-3/40 flex items-start gap-3">
          <Info className="w-4 h-4 text-ink-muted mt-0.5 shrink-0" strokeWidth={1.75} />
          <p className="text-[12.5px] text-ink-soft leading-[1.6]">
            These values are configured in code (
            <code className="font-mono text-[12px] text-ink">lib/school-config.ts</code>).
            Contact your developer to update them — a redeploy is required so receipts and
            the public site stay in sync.
          </p>
        </div>
      </Card>
    </>
  );
}
