import { z } from 'zod';

/**
 * Parents (Guardians) module — zod schemas for server-action input.
 *
 * Phone fields accept Pakistani formats but only validate loosely; the
 * server normalises them on the way to wa.me / tel: helpers.
 */

const phoneRegex = /^[+0-9\s\-()]{7,20}$/;

const optionalString = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .or(z.literal('').transform(() => undefined));

export const updateGuardianSchema = z.object({
  phone: z.string().regex(phoneRegex, 'Phone must be 7–20 digits').max(20),
  whatsapp: z
    .string()
    .regex(phoneRegex, 'WhatsApp must be 7–20 digits')
    .max(20)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  email: z
    .string()
    .email('Invalid email')
    .max(180)
    .transform((v) => v.trim().toLowerCase())
    .optional()
    .or(z.literal('').transform(() => undefined)),
  occupation: optionalString(120),
  address: optionalString(300),
});

export type UpdateGuardianInput = z.infer<typeof updateGuardianSchema>;

export const linkGuardianToStudentSchema = z.object({
  guardianId: z.string().min(1),
  studentId: z.string().min(1),
  isPrimary: z.boolean(),
});

export type LinkGuardianToStudentInput = z.infer<
  typeof linkGuardianToStudentSchema
>;
