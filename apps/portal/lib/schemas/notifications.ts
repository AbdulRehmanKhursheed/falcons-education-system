import { z } from 'zod';

export const NOTIFICATION_KINDS = [
  'ADMISSION',
  'FEE',
  'ATTENDANCE',
  'ASSESSMENT',
  'ANNOUNCEMENT',
  'SYSTEM',
] as const;

export type NotificationKindSchema = (typeof NOTIFICATION_KINDS)[number];

export const notificationFilterSchema = z.object({
  kind: z.enum(NOTIFICATION_KINDS).optional(),
  unreadOnly: z.boolean().optional(),
  take: z.number().int().positive().max(200).optional(),
  skip: z.number().int().nonnegative().optional(),
});

export type NotificationFilter = z.infer<typeof notificationFilterSchema>;

export const markAsReadSchema = z.object({
  id: z.string().min(1),
});

export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;
