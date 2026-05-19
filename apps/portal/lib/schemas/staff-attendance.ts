import { z } from 'zod';

/**
 * Staff attendance schemas — mirrors student attendance, but the subject is a
 * User row (TEACHER / SCHOOL_ADMIN / ACCOUNTANT) rather than a Student.
 */

export const staffAttendanceStatusSchema = z.enum([
  'PRESENT',
  'ABSENT',
  'LATE',
  'SICK',
  'EXCUSED',
]);

export type StaffAttendanceStatusInput = z.infer<typeof staffAttendanceStatusSchema>;

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

export const markStaffAttendanceSchema = z.object({
  userId: z.string().min(1),
  date: isoDateString,
  status: staffAttendanceStatusSchema,
  remark: z.string().max(500).optional().nullable(),
});

export type MarkStaffAttendanceInput = z.infer<typeof markStaffAttendanceSchema>;

export const markAllStaffPresentSchema = z.object({
  date: isoDateString,
});

export type MarkAllStaffPresentInput = z.infer<typeof markAllStaffPresentSchema>;
