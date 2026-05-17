'use server';

/**
 * Read-only server actions used by the client browse components for
 * Montessori observations + Primary grades. Mutations live in `_actions.ts`.
 */

import { requireRole } from '@/lib/auth-helpers';
import {
  getMontessoriObservations,
  getPrimaryGrades,
  type MontessoriObservationRow,
  type PrimaryGradeRow,
} from '@/lib/queries/assessments';

export async function searchMontessoriObservations(
  classroomId: string,
): Promise<{ rows: MontessoriObservationRow[]; total: number }> {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']);
  return getMontessoriObservations({ classroomId, take: 30, skip: 0 });
}

export async function searchPrimaryGrades(opts: {
  classroomId: string;
  term: string;
  subject: string;
}): Promise<{ rows: PrimaryGradeRow[]; total: number }> {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']);
  return getPrimaryGrades({
    classroomId: opts.classroomId,
    term: opts.term,
    subject: opts.subject,
    take: 100,
    skip: 0,
  });
}
