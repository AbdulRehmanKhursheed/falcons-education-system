'use server';

import { requireRole } from '@/lib/auth-helpers';
import { getTeachers, type TeacherListRow } from '@/lib/queries/teachers';

/**
 * Client-callable search wrapper for the teachers grid. Splits out from
 * _actions.ts so the bundle for mutation handlers stays small.
 */
export async function searchTeachers(
  query: string,
  activeOnly: boolean,
  page = 1,
): Promise<{ rows: TeacherListRow[]; total: number; page: number; pageSize: number }> {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const pageSize = 60;
  const skip = Math.max(0, (page - 1) * pageSize);
  const { rows, total } = await getTeachers({
    query,
    activeOnly,
    take: pageSize,
    skip,
  });

  return { rows, total, page, pageSize };
}
