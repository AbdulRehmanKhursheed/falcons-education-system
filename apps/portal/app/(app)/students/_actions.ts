'use server';

import { requireRole } from '@/lib/auth-helpers';
import { getStudents, type StudentRow } from '@/lib/queries/students';

export async function searchStudents(
  query: string,
  classroom: string,
  page = 1,
): Promise<{ rows: StudentRow[]; total: number; page: number; pageSize: number }> {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']);

  const pageSize = 50;
  const skip = Math.max(0, (page - 1) * pageSize);

  const { rows, total } = await getStudents({
    query,
    classroom,
    take: pageSize,
    skip,
  });

  return { rows, total, page, pageSize };
}
