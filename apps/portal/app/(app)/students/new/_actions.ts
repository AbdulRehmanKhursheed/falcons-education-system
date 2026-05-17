'use server';

import { requireRole } from '@/lib/auth-helpers';
import {
  searchGuardiansByPhone,
  type GuardianSearchResult,
} from '@/lib/queries/student-detail';

/**
 * Live guardian lookup used by the create-student form when an admin wants
 * to link an existing family rather than re-keying contact details.
 */
export async function searchGuardianAction(
  query: string,
): Promise<GuardianSearchResult[]> {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);
  return searchGuardiansByPhone(query);
}
