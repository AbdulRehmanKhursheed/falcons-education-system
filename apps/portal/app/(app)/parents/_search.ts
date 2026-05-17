'use server';

import { requireRole } from '@/lib/auth-helpers';
import { getGuardians, type GuardianRow } from '@/lib/queries/parents';

/**
 * Client-callable search wrapper for the parents/guardians table.
 */
export async function searchGuardians(
  query: string,
  relation: string,
  page = 1,
): Promise<{ rows: GuardianRow[]; total: number; page: number; pageSize: number }> {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const pageSize = 60;
  const skip = Math.max(0, (page - 1) * pageSize);
  const { rows, total } = await getGuardians({
    query,
    relation,
    take: pageSize,
    skip,
  });

  return { rows, total, page, pageSize };
}
