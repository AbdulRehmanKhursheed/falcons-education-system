import { z } from 'zod';

/**
 * Assessment schemas — two distinct shapes for the two main kinds of
 * assessment used at Falcons:
 *   • MONTESSORI_OBSERVATION — qualitative, area + milestone + notes
 *   • PRIMARY_GRADE         — quantitative, subject + score + grade
 *
 * The shared `baseFields` is what every Assessment needs to land in the DB.
 * Discriminated union on `kind` keeps the form types clean.
 */

export const montessoriAreas = [
  'Practical Life',
  'Sensorial',
  'Language',
  'Math',
  'Cultural',
  'Social',
  'Motor',
] as const;
export type MontessoriArea = (typeof montessoriAreas)[number];

export const primarySubjects = [
  'Math',
  'Urdu',
  'English',
  'Science',
  'Social Studies',
  'Islamiat',
  'Computer',
] as const;
export type PrimarySubject = (typeof primarySubjects)[number];

export const primaryGrades = ['A+', 'A', 'B+', 'B', 'C', 'F'] as const;
export type PrimaryGrade = (typeof primaryGrades)[number];

/**
 * Derive a letter grade from a percentage. Matches the school grade book:
 *  >= 90 → A+, >= 80 → A, >= 70 → B+, >= 60 → B, >= 50 → C, else F
 */
export function deriveGrade(score: number, scoreMax: number): PrimaryGrade {
  if (!Number.isFinite(score) || !Number.isFinite(scoreMax) || scoreMax <= 0) {
    return 'F';
  }
  const pct = (score / scoreMax) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  return 'F';
}

const studentId = z
  .string({ required_error: 'Select a student', invalid_type_error: 'Select a student' })
  .min(1, 'Select a student');
const term = z
  .string({ required_error: 'Term is required', invalid_type_error: 'Term is required' })
  .trim()
  .min(1, 'Term is required')
  .max(60);

export const montessoriObservationSchema = z.object({
  kind: z.literal('MONTESSORI_OBSERVATION'),
  studentId,
  area: z.enum(montessoriAreas, { errorMap: () => ({ message: 'Pick an area' }) }),
  milestone: z.string().trim().min(2, 'Milestone is required').max(240),
  notes: z.string().trim().max(2000).optional().or(z.literal('')).transform((v) => v || undefined),
  term: term.optional().or(z.literal('')).transform((v) => v || undefined),
});
export type MontessoriObservationInput = z.infer<typeof montessoriObservationSchema>;

/**
 * `discriminatedUnion` requires plain ZodObject members — no `.refine` wraps —
 * so the score ≤ scoreMax check is applied on the outer union via `superRefine`.
 */
export const primaryGradeSchema = z.object({
  kind: z.literal('PRIMARY_GRADE'),
  studentId,
  subject: z.enum(primarySubjects, { errorMap: () => ({ message: 'Pick a subject' }) }),
  term,
  score: z.coerce.number().min(0, 'Score must be ≥ 0').max(1000),
  scoreMax: z.coerce.number().min(1, 'Max must be ≥ 1').max(1000),
  grade: z.enum(primaryGrades).optional(),
  notes: z.string().trim().max(2000).optional().or(z.literal('')).transform((v) => v || undefined),
});
export type PrimaryGradeInput = z.infer<typeof primaryGradeSchema>;

export const assessmentInputSchema = z
  .discriminatedUnion('kind', [montessoriObservationSchema, primaryGradeSchema])
  .superRefine((data, ctx) => {
    if (data.kind === 'PRIMARY_GRADE' && data.score > data.scoreMax) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['score'],
        message: 'Score cannot exceed the max',
      });
    }
  });
export type AssessmentInput = z.infer<typeof assessmentInputSchema>;
