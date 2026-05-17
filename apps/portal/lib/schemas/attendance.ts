import { z } from 'zod';

export const attendanceStatusSchema = z.enum([
  'PRESENT',
  'ABSENT',
  'LATE',
  'SICK',
  'EXCUSED',
]);

export type AttendanceStatusInput = z.infer<typeof attendanceStatusSchema>;

/**
 * Dates flow over the wire as ISO date strings (YYYY-MM-DD) — the native
 * <input type="date"> serializes that way. Server normalizes to midnight UTC
 * before writing, matching the seed convention.
 */
const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

export const markAttendanceSchema = z.object({
  studentId: z.string().min(1),
  classroomId: z.string().min(1),
  date: isoDateString,
  status: attendanceStatusSchema,
});

export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;

export const markAllPresentSchema = z.object({
  classroomId: z.string().min(1),
  date: isoDateString,
});

export type MarkAllPresentInput = z.infer<typeof markAllPresentSchema>;

export const bulkUpdateSchema = z.object({
  classroomId: z.string().min(1),
  date: isoDateString,
  rows: z
    .array(
      z.object({
        studentId: z.string().min(1),
        status: attendanceStatusSchema,
      }),
    )
    .min(1),
});

export type BulkUpdateInput = z.infer<typeof bulkUpdateSchema>;
