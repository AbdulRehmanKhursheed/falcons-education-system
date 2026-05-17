import { z } from 'zod';

export const paymentMethodSchema = z.enum([
  'CASH',
  'BANK_TRANSFER',
  'JAZZCASH',
  'EASYPAISA',
  'CHEQUE',
  'OTHER',
]);

export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;

export const invoiceStatusSchema = z.enum([
  'DRAFT',
  'ISSUED',
  'PARTIALLY_PAID',
  'PAID',
  'OVERDUE',
  'CANCELLED',
]);

export type InvoiceStatusInput = z.infer<typeof invoiceStatusSchema>;

// ── Payments ───────────────────────────────────────────────────────────
//
// Dates flow over the wire as `datetime-local` strings (YYYY-MM-DDTHH:mm)
// from native inputs; we accept either that or a full ISO. The server
// normalizes via `new Date(...)`.
export const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.coerce
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than 0')
    .max(10_000_000, 'Amount looks too large'),
  method: paymentMethodSchema,
  reference: z
    .string()
    .max(120)
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : undefined)),
  paidAt: z.string().min(1).optional(),
  notes: z
    .string()
    .max(500)
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : undefined)),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

// ── Discounts ──────────────────────────────────────────────────────────
export const applyDiscountSchema = z.object({
  invoiceId: z.string().min(1),
  discount: z.coerce
    .number({ invalid_type_error: 'Discount must be a number' })
    .min(0, 'Discount cannot be negative')
    .max(10_000_000, 'Discount looks too large'),
});

export type ApplyDiscountInput = z.infer<typeof applyDiscountSchema>;

// ── Fee structures ─────────────────────────────────────────────────────
export const feeStructureSchema = z.object({
  id: z.string().optional(),
  classroomId: z.string().min(1, 'Classroom is required'),
  name: z.string().min(2, 'Name is too short').max(120),
  amount: z.coerce
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than 0')
    .max(10_000_000),
  frequency: z.enum(['monthly', 'quarterly', 'one-time']),
  active: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((v) =>
      typeof v === 'string' ? v === 'on' || v === 'true' : Boolean(v),
    ),
});

export type FeeStructureInput = z.infer<typeof feeStructureSchema>;
