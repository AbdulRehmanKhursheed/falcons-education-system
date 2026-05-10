import { PageHeader } from '@/components/layout/PageHeader';
import { ComingSoon } from '@/components/ui/ComingSoon';

export const metadata = { title: 'Parents' };

export default function ParentsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Section · 04 / Parents"
        title="Parents"
        description="Guardian records, sibling linkage, and the parent portal."
      />
      <ComingSoon
        module="Parents"
        description="Guardian profiles linked to one or more enrolled children, and the parent-facing portal for attendance, fees, notices, and homework."
        bullets={[
          'Guardian profiles with multiple children',
          'Parent portal access (separate login)',
          'Per-child attendance, fees, homework view',
          'Announcement broadcasts to selected groups',
          'Two-way messaging with class teacher (Phase 3)',
        ]}
      />
    </>
  );
}
