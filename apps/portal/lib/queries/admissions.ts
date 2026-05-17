/**
 * Admissions queries — return the same shape as the previous mock `Application`
 * so the pipeline component swaps in cleanly.
 */

import { db } from '@/lib/db';

export type ApplicationRow = {
  id: string;
  applicantName: string;
  childAge: string;
  programInterest: string;
  parentPhone: string;
  submittedDate: string; // ISO
  stage: 'received' | 'interview' | 'approved' | 'enrolled' | 'declined';
  source: 'website' | 'whatsapp' | 'walk-in' | 'referral' | 'phone';
};

const stageMap: Record<string, ApplicationRow['stage']> = {
  RECEIVED: 'received',
  INTERVIEW: 'interview',
  APPROVED: 'approved',
  ENROLLED: 'enrolled',
  DECLINED: 'declined',
  WITHDRAWN: 'declined',
};

const sourceMap: Record<string, ApplicationRow['source']> = {
  WEBSITE: 'website',
  WHATSAPP: 'whatsapp',
  WALK_IN: 'walk-in',
  REFERRAL: 'referral',
  PHONE: 'phone',
};

const programLabel: Record<string, string> = {
  NURSERY: 'Nursery',
  MONTESSORI: 'Montessori Level',
  KINDERGARTEN: 'KG',
  PRIMARY: 'Primary',
  EVENING_COACHING: 'Evening Coaching',
  SATURDAY_COACHING: 'Saturday Coaching',
  COMPUTER_COURSE: 'Computer Course',
};

export async function getApplications(): Promise<ApplicationRow[]> {
  const apps = await db.application.findMany({
    orderBy: { submittedAt: 'desc' },
    select: {
      id: true,
      applicantName: true,
      childAge: true,
      programInterest: true,
      parentPhone: true,
      submittedAt: true,
      stage: true,
      source: true,
    },
  });

  return apps.map((a) => ({
    id: a.id,
    applicantName: a.applicantName,
    childAge: a.childAge,
    programInterest: programLabel[a.programInterest] ?? a.programInterest,
    parentPhone: a.parentPhone,
    submittedDate: a.submittedAt.toISOString(),
    stage: stageMap[a.stage] ?? 'received',
    source: sourceMap[a.source] ?? 'website',
  }));
}
