import { UsersRound, ShieldCheck, Users as UsersIcon, MessageCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { KPI } from '@/components/data/KPI';
import { ParentsTable } from '@/components/data/ParentsTable';
import { getGuardians, getParentsKpis } from '@/lib/queries/parents';
import { formatNumber } from '@/lib/format';
import { requireRole } from '@/lib/auth-helpers';

export const metadata = { title: 'Parents' };

export default async function ParentsPage() {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const [kpis, list] = await Promise.all([
    getParentsKpis(),
    getGuardians({ query: '', relation: 'All', take: 60, skip: 0 }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Section · 04 / Parents"
        title="Parents"
        description="Guardian directory with sibling linkage, WhatsApp shortcuts, and per-child rollups."
      />

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPI
          label="Total guardians"
          value={formatNumber(kpis.totalGuardians)}
          Icon={UsersRound}
        />
        <KPI
          label="Primary contacts"
          value={formatNumber(kpis.primaryContacts)}
          Icon={ShieldCheck}
        />
        <KPI
          label="With siblings"
          value={formatNumber(kpis.multipleChildren)}
          Icon={UsersIcon}
        />
        <KPI
          label="On WhatsApp"
          value={formatNumber(kpis.withWhatsapp)}
          Icon={MessageCircle}
        />
      </div>

      <ParentsTable
        initialRows={list.rows}
        initialTotal={list.total}
        relations={list.relations}
      />
    </>
  );
}
