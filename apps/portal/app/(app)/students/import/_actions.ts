'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import { parseCSV } from '@/lib/csv';

// ── Schema for a single CSV row ────────────────────────────────────────────
//
// Looser than the manual create-student schema because the school's existing
// roster may not have every optional field cleanly. Required fields:
//   firstName, lastName, dateOfBirth, gender, classroomName,
//   guardianName, guardianRelation, guardianPhone

const phoneRegex = /^[+0-9\s\-()]{7,20}$/;
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

export const importRowSchema = z.object({
  firstName: z.string().min(1, 'firstName is required').max(80).trim(),
  lastName: z.string().min(1, 'lastName is required').max(80).trim(),
  dateOfBirth: isoDate,
  gender: z.enum(['male', 'female', 'other']),
  classroomName: z.string().min(1, 'classroomName is required').trim(),
  guardianName: z.string().min(2, 'guardianName too short').max(120).trim(),
  guardianRelation: z.string().min(1, 'guardianRelation required').max(40).trim(),
  guardianPhone: z.string().regex(phoneRegex, 'guardianPhone invalid').max(20),
  guardianWhatsapp: z
    .string()
    .regex(phoneRegex, 'guardianWhatsapp invalid')
    .max(20)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  guardianEmail: z
    .string()
    .email('guardianEmail invalid')
    .max(180)
    .transform((v) => v.trim().toLowerCase())
    .optional()
    .or(z.literal('').transform(() => undefined)),
  guardianCnic: z.string().max(20).optional().or(z.literal('').transform(() => undefined)),
  admissionDate: isoDate.optional().or(z.literal('').transform(() => undefined)),
});

export type ImportRow = z.infer<typeof importRowSchema>;

export type ValidRow = {
  rowNumber: number;
  data: ImportRow;
  classroomId: string;
  duplicateOfRollNo?: string; // if matched-existing skip
};

export type ErrorRow = {
  rowNumber: number;
  raw: Record<string, string>;
  errors: string[];
};

export type SkippedRow = {
  rowNumber: number;
  raw: Record<string, string>;
  reason: string;
  existingRollNo?: string;
};

export type PreviewResult =
  | { ok: false; error: string }
  | {
      ok: true;
      valid: ValidRow[];
      skipped: SkippedRow[];
      errors: ErrorRow[];
      classroomsMissing: string[];
    };

const EXPECTED_HEADERS = [
  'firstName',
  'lastName',
  'dateOfBirth',
  'gender',
  'classroomName',
  'guardianName',
  'guardianRelation',
  'guardianPhone',
  'guardianWhatsapp',
  'guardianEmail',
  'guardianCnic',
  'admissionDate',
];

const MAX_BYTES = 1_000_000; // 1 MB

// ── Preview: parse + validate, no DB writes ────────────────────────────────

export async function previewImport(formData: FormData): Promise<PreviewResult> {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return { ok: false, error: 'No file uploaded' };
  }
  if (file.size === 0) return { ok: false, error: 'File is empty' };
  if (file.size > MAX_BYTES) {
    return { ok: false, error: `File too large (max ${Math.round(MAX_BYTES / 1000)} KB)` };
  }

  const text = await file.text();
  const rows = parseCSV(text);
  if (rows.length === 0) return { ok: false, error: 'CSV is empty' };

  // Validate header — flexible ordering, but every expected column must appear.
  const headers = rows[0].map((h) => h.trim());
  const missingHeaders = EXPECTED_HEADERS.filter(
    (h) => !['guardianWhatsapp', 'guardianEmail', 'guardianCnic', 'admissionDate'].includes(h)
      && !headers.includes(h),
  );
  if (missingHeaders.length > 0) {
    return {
      ok: false,
      error: `Missing required columns: ${missingHeaders.join(', ')}`,
    };
  }

  const headerIndex: Record<string, number> = {};
  headers.forEach((h, i) => {
    headerIndex[h] = i;
  });

  const get = (row: string[], key: string) => {
    const idx = headerIndex[key];
    return idx === undefined ? '' : (row[idx] ?? '').trim();
  };

  // Load classrooms once
  const classrooms = await db.classroom.findMany({
    select: { id: true, name: true },
  });
  const classroomByName = new Map(classrooms.map((c) => [c.name.toLowerCase(), c]));

  const valid: ValidRow[] = [];
  const errors: ErrorRow[] = [];
  const skipped: SkippedRow[] = [];
  const seenInFile = new Set<string>(); // key: firstName|lastName|dob (lowercase)
  const classroomsMissingSet = new Set<string>();

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const rowNumber = r + 1; // human row numbers, header is row 1

    // Build a raw object for error reporting
    const raw: Record<string, string> = {};
    EXPECTED_HEADERS.forEach((h) => {
      raw[h] = get(row, h);
    });

    // Skip a fully empty row silently
    if (Object.values(raw).every((v) => v === '')) continue;

    const parsed = importRowSchema.safeParse(raw);
    if (!parsed.success) {
      const issues = parsed.error.issues.map(
        (i) => `${i.path.join('.') || 'row'}: ${i.message}`,
      );
      errors.push({ rowNumber, raw, errors: issues });
      continue;
    }
    const data = parsed.data;

    // Classroom must exist
    const classroom = classroomByName.get(data.classroomName.toLowerCase());
    if (!classroom) {
      classroomsMissingSet.add(data.classroomName);
      errors.push({
        rowNumber,
        raw,
        errors: [`classroomName: "${data.classroomName}" not found`],
      });
      continue;
    }

    // Dedupe within file
    const fileKey = `${data.firstName.toLowerCase()}|${data.lastName.toLowerCase()}|${data.dateOfBirth}`;
    if (seenInFile.has(fileKey)) {
      skipped.push({
        rowNumber,
        raw,
        reason: 'Duplicate within file (same name + date of birth)',
      });
      continue;
    }
    seenInFile.add(fileKey);

    // Existing student in DB?
    const existing = await db.student.findFirst({
      where: {
        firstName: { equals: data.firstName, mode: 'insensitive' },
        lastName: { equals: data.lastName, mode: 'insensitive' },
        dateOfBirth: new Date(data.dateOfBirth),
        deletedAt: null,
      },
      select: { rollNo: true },
    });
    if (existing) {
      skipped.push({
        rowNumber,
        raw,
        reason: 'Already in roster',
        existingRollNo: existing.rollNo,
      });
      continue;
    }

    valid.push({
      rowNumber,
      data,
      classroomId: classroom.id,
    });
  }

  return {
    ok: true,
    valid,
    skipped,
    errors,
    classroomsMissing: Array.from(classroomsMissingSet),
  };
}

// ── Commit: transactional create of all valid rows ────────────────────────

export type CommitResult =
  | { ok: false; error: string }
  | { ok: true; created: number; firstRollNo: string | null; lastRollNo: string | null };

/**
 * Compute the next sequence start. We call this once before the loop and
 * increment locally — generating roll numbers inside the transaction with
 * lookups would N+1 the import.
 */
async function nextRollNoStart(): Promise<{ prefix: string; next: number }> {
  const year = new Date().getFullYear();
  const prefix = `FES-${year}-`;
  const latest = await db.student.findFirst({
    where: { rollNo: { startsWith: prefix } },
    orderBy: { rollNo: 'desc' },
    select: { rollNo: true },
  });
  let next = 1;
  if (latest) {
    const numPart = latest.rollNo.slice(prefix.length);
    const n = parseInt(numPart, 10);
    if (!Number.isNaN(n)) next = n + 1;
  }
  return { prefix, next };
}

export async function commitImport(validRows: ValidRow[]): Promise<CommitResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  if (!Array.isArray(validRows) || validRows.length === 0) {
    return { ok: false, error: 'No valid rows to import' };
  }
  if (validRows.length > 2000) {
    return { ok: false, error: 'Too many rows (max 2000 per import)' };
  }

  // Re-validate each row server-side (don't trust the client payload)
  for (const v of validRows) {
    const parsed = importRowSchema.safeParse(v.data);
    if (!parsed.success) {
      return { ok: false, error: `Row ${v.rowNumber} re-validation failed` };
    }
    if (!v.classroomId || typeof v.classroomId !== 'string') {
      return { ok: false, error: `Row ${v.rowNumber} missing classroomId` };
    }
  }

  const { prefix, next: startNext } = await nextRollNoStart();
  let counter = startNext;
  const assignedRollNos: string[] = [];
  const createdStudentIds: string[] = [];

  try {
    await db.$transaction(async (tx) => {
      for (const v of validRows) {
        const data = v.data;

        // Try to find existing guardian by phone match (case sensitive — phones
        // are normalized strings in our schema)
        let guardianId: string;
        const existingGuardian = await tx.guardian.findFirst({
          where: { phone: data.guardianPhone, deletedAt: null },
          select: { id: true },
        });
        if (existingGuardian) {
          guardianId = existingGuardian.id;
        } else {
          const created = await tx.guardian.create({
            data: {
              fullName: data.guardianName,
              relation: data.guardianRelation,
              phone: data.guardianPhone,
              whatsapp: data.guardianWhatsapp ?? null,
              email: data.guardianEmail ?? null,
              cnic: data.guardianCnic ?? null,
              isPrimary: true,
            },
            select: { id: true },
          });
          guardianId = created.id;
        }

        const rollNo = `${prefix}${String(counter).padStart(3, '0')}`;
        counter += 1;
        assignedRollNos.push(rollNo);

        const fullName = `${data.firstName} ${data.lastName}`.trim();

        const student = await tx.student.create({
          data: {
            rollNo,
            firstName: data.firstName,
            lastName: data.lastName,
            fullName,
            dateOfBirth: new Date(data.dateOfBirth),
            gender: data.gender,
            status: 'ACTIVE',
            admissionDate: data.admissionDate ? new Date(data.admissionDate) : new Date(),
          },
          select: { id: true },
        });
        createdStudentIds.push(student.id);

        await tx.studentGuardian.create({
          data: {
            studentId: student.id,
            guardianId,
            isPrimary: true,
          },
        });

        await tx.enrollment.create({
          data: {
            studentId: student.id,
            classroomId: v.classroomId,
            enrolledAt: data.admissionDate ? new Date(data.admissionDate) : new Date(),
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'student.import',
          entityType: 'Student',
          entityId: createdStudentIds[0] ?? 'bulk',
          diff: {
            count: validRows.length,
            firstRollNo: assignedRollNos[0] ?? null,
            lastRollNo: assignedRollNos[assignedRollNos.length - 1] ?? null,
            studentIds: createdStudentIds,
          },
        },
      });
    }, { timeout: 60_000 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Import failed';
    return { ok: false, error: msg };
  }

  revalidatePath('/students');
  revalidatePath('/dashboard');

  return {
    ok: true,
    created: validRows.length,
    firstRollNo: assignedRollNos[0] ?? null,
    lastRollNo: assignedRollNos[assignedRollNos.length - 1] ?? null,
  };
}
