import { z } from 'zod';
import { checkPasswordPolicy, PASSWORD_MIN_LENGTH } from '@/lib/password';

/**
 * Login schema — intentionally permissive on min length so existing accounts
 * created before the policy can still authenticate. The policy is enforced
 * on create/reset via `strongPasswordSchema` below.
 */
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Stronger password schema for new password assignment (create user, reset,
 * change-password). Mirrors `lib/password.ts` policy and surfaces the
 * detailed error message from the policy checker.
 */
export const strongPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH)
  .refine(
    (val) => checkPasswordPolicy(val).ok,
    (val) => {
      const result = checkPasswordPolicy(val);
      return {
        message: result.ok ? 'OK' : result.message,
      };
    },
  );

export const setPasswordSchema = z.object({
  password: strongPasswordSchema,
});

export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
