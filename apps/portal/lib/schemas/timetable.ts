import { z } from 'zod';

// HH:MM 24h time string (00:00 – 23:59).
const timeString = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Expected HH:MM (24-hour)');

// ── Subject ────────────────────────────────────────────────────────────────

export const subjectCreateSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(60, 'Name is too long'),
  code: z
    .string()
    .trim()
    .max(8, 'Code is too long')
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v.toUpperCase() : null)),
  order: z.coerce.number().int().min(0).max(999).default(0),
  active: z.coerce.boolean().default(true),
});

export type SubjectCreateInput = z.input<typeof subjectCreateSchema>;

export const subjectUpdateSchema = subjectCreateSchema.extend({
  id: z.string().min(1),
});

export type SubjectUpdateInput = z.input<typeof subjectUpdateSchema>;

// ── Period ─────────────────────────────────────────────────────────────────

export const periodCreateSchema = z
  .object({
    number: z.coerce.number().int().min(1, 'Number must be ≥ 1').max(20, 'Number is too high'),
    startTime: timeString,
    endTime: timeString,
    label: z
      .string()
      .trim()
      .max(60)
      .optional()
      .nullable()
      .transform((v) => (v && v.length > 0 ? v : null)),
    isBreak: z.coerce.boolean().default(false),
  })
  .refine((v) => toMinutes(v.endTime) > toMinutes(v.startTime), {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

export type PeriodCreateInput = z.input<typeof periodCreateSchema>;

export const periodUpdateSchema = z
  .object({
    id: z.string().min(1),
    number: z.coerce.number().int().min(1).max(20),
    startTime: timeString,
    endTime: timeString,
    label: z
      .string()
      .trim()
      .max(60)
      .optional()
      .nullable()
      .transform((v) => (v && v.length > 0 ? v : null)),
    isBreak: z.coerce.boolean().default(false),
  })
  .refine((v) => toMinutes(v.endTime) > toMinutes(v.startTime), {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

export type PeriodUpdateInput = z.input<typeof periodUpdateSchema>;

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// ── Timetable entry ────────────────────────────────────────────────────────

const nullableId = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((v) => (v && v.length > 0 ? v : null));

export const upsertEntrySchema = z.object({
  classroomId: z.string().min(1),
  periodId: z.string().min(1),
  dayOfWeek: z.coerce.number().int().min(1, 'Day must be 1–6').max(6, 'Day must be 1–6'),
  subjectId: nullableId,
  teacherId: nullableId,
  notes: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

export type UpsertEntryInput = z.input<typeof upsertEntrySchema>;
