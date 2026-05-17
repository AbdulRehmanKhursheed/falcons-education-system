import Link from 'next/link';
import {
  Building2,
  CalendarRange,
  Receipt,
  UsersRound,
  Megaphone,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { requireRole } from '@/lib/auth-helpers';
import { getSettingsKpis } from '@/lib/queries/settings';
import { formatNumber } from '@/lib/format';
import { schoolProfile } from '@/lib/school-config';

export const metadata = { title: 'Settings' };

type Section = {
  number: string;
  title: string;
  description: string;
  stat: string;
  href: string;
  Icon: typeof Building2;
  external?: boolean;
};

export default async function SettingsPage() {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);
  const kpis = await getSettingsKpis();

  const sections: Section[] = [
    {
      number: '01',
      title: 'School Profile',
      description:
        'Name, address, phone, license. The system of record for identity used across receipts and the public site.',
      stat: schoolProfile.name,
      href: '/settings/school-profile',
      Icon: Building2,
    },
    {
      number: '02',
      title: 'Academic Years',
      description:
        'Define academic sessions, mark the current year, and retire historical ones once classes have wound down.',
      stat: kpis.currentYearName
        ? `${formatNumber(kpis.academicYears)} on record · ${kpis.currentYearName} current`
        : `${formatNumber(kpis.academicYears)} on record · none current`,
      href: '/settings/academic-years',
      Icon: CalendarRange,
    },
    {
      number: '03',
      title: 'Fee Structures',
      description:
        'Per-classroom monthly, quarterly and one-time fees. Used to generate invoices in the Fees module.',
      stat: `${formatNumber(kpis.feeStructures)} active templates`,
      href: '/fees/structures',
      Icon: Receipt,
      external: true,
    },
    {
      number: '04',
      title: 'User Management',
      description:
        'Staff and parent accounts. Change roles, reset passwords, and deactivate access. Mutations are Super Admin only.',
      stat: `${formatNumber(kpis.activeUsers)} active · ${formatNumber(kpis.users)} total`,
      href: '/settings/users',
      Icon: UsersRound,
    },
    {
      number: '05',
      title: 'Announcements',
      description:
        'Broadcast notices to staff, parents, or specific classrooms. Pinned announcements stay at the top of the dashboard.',
      stat:
        kpis.pinnedAnnouncements > 0
          ? `${formatNumber(kpis.announcements)} total · ${kpis.pinnedAnnouncements} pinned`
          : `${formatNumber(kpis.announcements)} total`,
      href: '/settings/announcements',
      Icon: Megaphone,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Section · 05 / Settings"
        title="Settings"
        description="School-wide configuration. Most settings are role-restricted to School Admin and Super Admin."
        actions={
          <span className="inline-flex items-center gap-2 text-[12px] text-ink-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
            Signed in as {session.user.role.replace('_', ' ').toLowerCase()}
          </span>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((s) => (
          <Card key={s.number} className="hover:border-line-strong transition-colors group">
            <div className="px-5 py-5 flex flex-col gap-4 h-full">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-surface-3 text-accent border border-line-soft"
                  >
                    <s.Icon className="w-4 h-4" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="eyebrow text-ink-faint">{s.number}</p>
                    <h3
                      className="font-display text-lg text-ink leading-tight"
                      style={{ fontVariationSettings: '"opsz" 24' }}
                    >
                      {s.title}
                    </h3>
                  </div>
                </div>
                {s.external && <Chip tone="info">Fees module</Chip>}
              </div>

              <p className="text-[13.5px] text-ink-soft leading-[1.65]">{s.description}</p>

              <div className="mt-auto flex items-center justify-between gap-3 pt-2 border-t border-line-soft">
                <span className="text-[12px] text-ink-muted tabular truncate">{s.stat}</span>
                <Link
                  href={s.href}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-soft hover:text-ink transition-colors"
                >
                  Manage
                  <ArrowUpRight
                    className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                    strokeWidth={2}
                  />
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
