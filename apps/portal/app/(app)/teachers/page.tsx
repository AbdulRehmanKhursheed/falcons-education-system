import { PageHeader } from '@/components/layout/PageHeader';
import { ComingSoon } from '@/components/ui/ComingSoon';

export const metadata = { title: 'Teachers' };

export default function TeachersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Section · 04 / Teachers"
        title="Teachers"
        description="Staff records, classroom assignments, and the teacher portal access controls."
      />
      <ComingSoon
        module="Teachers"
        description="Teacher records, classroom assignments, and the access surface for the dedicated teacher portal."
        bullets={[
          'Teacher profiles with qualifications and contact info',
          'Classroom and subject assignments',
          'Attendance marking permissions per classroom',
          'Homework upload and student remarks workflow',
          'Per-teacher activity log',
        ]}
      />
    </>
  );
}
