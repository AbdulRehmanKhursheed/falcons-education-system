import { PageHeader } from '@/components/layout/PageHeader';
import { ComingSoon } from '@/components/ui/ComingSoon';

export const metadata = { title: 'Assessments' };

export default function AssessmentsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Section · 02 / Assessments"
        title="Assessments"
        description="Montessori observations for early years; structured grades for primary classes."
      />
      <ComingSoon
        module="Assessments"
        description="A dual-mode assessment system — qualitative Montessori observations for early years and structured grades for primary classes."
        bullets={[
          'Montessori observation log — communication, motor, social, sensorial milestones',
          'Primary school grade entry per subject, per term',
          'Auto-generated report cards (PDF) with school branding',
          'Progress tracking across the year per student',
          'Teacher remarks visible to parents in their portal',
        ]}
      />
    </>
  );
}
