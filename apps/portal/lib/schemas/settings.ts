import { z } from 'zod';

// ── Academic year ──────────────────────────────────────────────────────────

export const academicYearSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(4, 'Name is too short (e.g. "2026-27")')
      .max(16, 'Name is too long'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((v) => v.endDate.getTime() > v.startDate.getTime(), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export type AcademicYearInput = z.infer<typeof academicYearSchema>;

// ── Users ──────────────────────────────────────────────────────────────────

export const roleEnum = z.enum([
  'SUPER_ADMIN',
  'SCHOOL_ADMIN',
  'TEACHER',
  'PARENT',
  'ACCOUNTANT',
]);

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: roleEnum,
});

export const resetPasswordSchema = z.object({
  userId: z.string().min(1),
  newPassword: z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .max(128, 'Password too long'),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ── Announcements ──────────────────────────────────────────────────────────

export const announcementAudienceEnum = z.enum([
  'ALL',
  'STAFF_ONLY',
  'PARENTS_ONLY',
  'CLASSROOM',
  'CUSTOM',
]);

export const announcementSchema = z
  .object({
    title: z.string().trim().min(2, 'Title is too short').max(140),
    body: z.string().trim().min(2, 'Body is too short').max(8000),
    audience: announcementAudienceEnum,
    classroomId: z.string().optional().nullable(),
    publishAt: z.coerce.date().optional(),
    expiresAt: z.coerce.date().optional().nullable(),
    pinned: z.coerce.boolean().optional().default(false),
  })
  .refine(
    (v) => v.audience !== 'CLASSROOM' || (v.classroomId && v.classroomId.length > 0),
    {
      message: 'Pick a classroom when audience is CLASSROOM',
      path: ['classroomId'],
    },
  )
  .refine(
    (v) => !v.expiresAt || !v.publishAt || v.expiresAt.getTime() > v.publishAt.getTime(),
    { message: 'Expiry must be after publish time', path: ['expiresAt'] },
  );

export type AnnouncementInput = z.infer<typeof announcementSchema>;
