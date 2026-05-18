/**
 * Password policy for the Falcons portal.
 *
 * Used at account-creation / password-reset paths. NOT used at login (we
 * deliberately don't reject existing passwords that pre-date the policy).
 *
 * Policy:
 *   - Minimum 10 characters
 *   - At least one uppercase letter
 *   - At least one lowercase letter
 *   - At least one digit
 *   - At least one symbol from a defined set
 *   - Not on the common-passwords blocklist (case-insensitive)
 */

export const PASSWORD_MIN_LENGTH = 10;
// The symbol set is intentionally narrow — easy for staff to type on a PK/IN
// keyboard, but broad enough to give meaningful entropy.
// eslint-disable-next-line no-useless-escape
const SYMBOL_RE = /[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|~`]/;
const UPPER_RE = /[A-Z]/;
const LOWER_RE = /[a-z]/;
const DIGIT_RE = /\d/;

// Top common passwords blocklist (lowercase). Hardcoded to avoid a runtime
// dependency. Includes localised + obvious choices for a Pakistani school.
const COMMON_PASSWORDS = new Set<string>([
  'password',
  'password1',
  'password123',
  'passw0rd',
  'p@ssw0rd',
  'p@ssword',
  'qwerty',
  'qwerty123',
  'qwertyuiop',
  '12345678',
  '123456789',
  '1234567890',
  '111111',
  '11111111',
  '123123',
  '654321',
  'abc123',
  'abcd1234',
  'letmein',
  'welcome',
  'welcome1',
  'admin',
  'admin123',
  'administrator',
  'root',
  'toor',
  'iloveyou',
  'monkey',
  'dragon',
  'sunshine',
  'princess',
  'football',
  'baseball',
  'master',
  'master1',
  'shadow',
  'superman',
  'batman',
  'trustno1',
  'falcons',
  'falcons1',
  'falcons123',
  'falconseducation',
  'pakistan',
  'pakistan1',
  'pakistan123',
  'rawalpindi',
  'islamabad',
  'karachi',
  'lahore',
  'school',
  'school123',
  'teacher',
  'teacher123',
  'student',
  'student123',
  'changeme',
  'changeme1',
  'default',
  'guest',
]);

export type PasswordPolicyError =
  | 'too_short'
  | 'no_uppercase'
  | 'no_lowercase'
  | 'no_digit'
  | 'no_symbol'
  | 'too_common';

export type PasswordPolicyResult =
  | { ok: true }
  | { ok: false; errors: PasswordPolicyError[]; message: string };

export function checkPasswordPolicy(password: string): PasswordPolicyResult {
  const errors: PasswordPolicyError[] = [];
  if (password.length < PASSWORD_MIN_LENGTH) errors.push('too_short');
  if (!UPPER_RE.test(password)) errors.push('no_uppercase');
  if (!LOWER_RE.test(password)) errors.push('no_lowercase');
  if (!DIGIT_RE.test(password)) errors.push('no_digit');
  if (!SYMBOL_RE.test(password)) errors.push('no_symbol');
  if (COMMON_PASSWORDS.has(password.toLowerCase())) errors.push('too_common');

  if (errors.length === 0) return { ok: true };
  return { ok: false, errors, message: describePolicyErrors(errors) };
}

function describePolicyErrors(errors: PasswordPolicyError[]): string {
  const parts: string[] = [];
  if (errors.includes('too_short')) parts.push(`at least ${PASSWORD_MIN_LENGTH} characters`);
  if (errors.includes('no_uppercase')) parts.push('an uppercase letter');
  if (errors.includes('no_lowercase')) parts.push('a lowercase letter');
  if (errors.includes('no_digit')) parts.push('a digit');
  if (errors.includes('no_symbol')) parts.push('a symbol');
  if (errors.includes('too_common'))
    return 'Password is too common. Choose something unique.';
  if (parts.length === 0) return 'Password does not meet policy.';
  return `Password must include ${parts.join(', ')}.`;
}
