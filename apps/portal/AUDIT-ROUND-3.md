# Portal audit (round 3) — 2026-05-21

Full re-review of the portal codebase. Findings from `AUDIT.md` (round 1) and
`AUDIT-ROUND-2.md` (round 2) are not repeated.

## Severity legend

| Tier | Meaning |
|------|---------|
| **P0 — Critical** | Must fix before any real user touches the system. Data leaks, money inconsistencies, or loss of records. |
| **P1 — Important** | Should be resolved before a production pilot. Broken workflows or misleading data that will confuse or block real users. |
| **P2 — Polish** | Low-risk quality issues. Fix during normal iteration. |

---

## P0 — Critical

### P0-01 · `recordPayment` — TOCTOU race corrupts running invoice balance
**File:** `app/(app)/fees/_actions.ts:80–147`
**Issue:** `invoice.amountPaid` is read at line 80 outside the `db.$transaction`
that performs the write at line 131. `nextPaid` (line 99) and the overpayment
guard (line 102) are computed from the stale snapshot. Under PostgreSQL READ
COMMITTED, two concurrent accountant sessions recording payments against the
same invoice will both read the same `amountPaid`, both pass the overpayment
check, and both create a `Payment` row, but the second `UPDATE` overwrites the
first — `amountPaid` ends up at `currentPaid + amount₁` instead of
`currentPaid + amount₁ + amount₂`. The second payment is permanently lost from
the running balance. `deriveStatus` is also computed from the stale value, so
the invoice's status may end up wrong (e.g., still PARTIALLY_PAID when it
should be PAID).
**Fix:** Move the invoice fetch inside an interactive transaction so the
second call blocks until the first commits, then derives `nextPaid` from the
fresh row. The notification fan-out stays outside the transaction.

### P0-02 · `commitImport` — roll-number race + lex-sort bug
**File:** `app/(app)/students/import/_actions.ts:241–315`
**Issue:** Three combined bugs in the bulk CSV import path.
1. `nextRollNoStart()` (line 279) runs outside the `db.$transaction` at line 285.
   Two admins clicking "Confirm import" concurrently both receive the same
   starting counter, both try to create students with the same roll numbers,
   and the second transaction rolls back with a `Student.rollNo` unique
   constraint violation — the admin sees "Import failed" with no idea why.
2. `nextRollNoStart` uses `orderBy: { rollNo: 'desc' }` (line 246) which is
   lexicographic. Once a year has ≥ 1000 students, `FES-2026-999` sorts higher
   than `FES-2026-1000`, the function returns 999 → 1000, and the collision
   crashes the import. The single-student create path
   (`students/[id]/_actions.ts:138-151`) already uses numeric-max; this path
   never received the fix.
3. `padStart(3, '0')` at line 314 emits `FES-2026-001 … 999` while every other
   roll-number emitter uses 4-digit padding. The mixed format breaks
   lexicographic ordering in admin tables and looks inconsistent to staff.
**Fix:** Move the sequence computation inside the transaction, switch to
`findMany` + numeric max, change pad width to 4.

---

## P1 — Important

### P1-01 · `updateAssessment` lets a TEACHER reassign an assessment to any `studentId`
**File:** `app/(app)/assessments/_actions.ts:109–161`, `lib/schemas/assessments.ts:55-88`
**Issue:** `updateAssessment` only checks that the **existing** record's
`assessedById` matches the current user (line 123-128). It then writes
`data = buildPrismaData(parsed.data)`, which includes `studentId: input.studentId`
(see `lib/schemas/assessments.ts:210, 226`). The `db.assessment.update` at
line 143 therefore overwrites `studentId` with whatever the form submitted. A
teacher can craft a `FormData` POST with a different `studentId` and silently
reassign their own assessment to any student in the school — including
students in other classrooms or graduated students. There is no ownership
check on the target student.
**Fix:** Either omit `studentId` from the update set (reassignment is rare
enough that delete + recreate is acceptable), or — if reassignment must be
supported — verify the new `studentId` belongs to a student in one of the
teacher's homeroom classrooms before writing.

### P1-02 · `scheduleInterview` writes interview data onto DECLINED applications
**File:** `app/(app)/admissions/[id]/_actions.ts:81–129`
**Issue:** The action saves `interviewAt` and `interviewNotes` regardless of
stage (lines 104-115). Stage is only advanced to `INTERVIEW` when the current
stage is `RECEIVED` or `WITHDRAWN`. For `DECLINED` applications the interview
data is written silently — `stage` stays `DECLINED` — creating a contradictory
state: a declined application with a scheduled future interview. The
`moveStage` guard (`admissions/_actions.ts:30-37`) correctly forbids
`DECLINED → INTERVIEW`, but `scheduleInterview` bypasses that gate entirely.
**Fix:** Reject up front when `existing.stage` is `DECLINED` or `ENROLLED`.

### P1-03 · `ensureTeacherOwnsClassroom` blocks timetable-assigned subject teachers
**File:** `app/(app)/homework/_actions.ts:48–59`
**Issue:** The helper resolves only the teacher's `homerooms` relation. A
subject teacher assigned to a classroom via `TimetableEntry` but who isn't
that classroom's homeroom teacher receives "You can only post to your own
homerooms" when posting homework — silently blocking a legitimate workflow.
**Fix:** Extend the check to allow posting when the teacher has at least one
`TimetableEntry` for the classroom.

### P1-04 · `applyDiscount` stale read outside transaction can overwrite correct status
**File:** `app/(app)/fees/_actions.ts:186–229`
**Issue:** Same structural problem as P0-01: `invoice.amountPaid` is fetched
outside the `db.$transaction` and `deriveStatus` is computed from the stale
value (line 208). If a concurrent `recordPayment` lands between the read and
the write, `applyDiscount` will overwrite the correct PAID status with
PARTIALLY_PAID. Money totals aren't double-counted (discount only edits
`total`/`discount`), but the displayed status regresses.
**Fix:** Read the invoice inside an interactive transaction so concurrent
writes serialise. Also revalidate the parent-facing fee paths — currently
only admin views are revalidated.

---

## P1 (curated, final list)

1. P1-01 — `updateAssessment` TEACHER can reassign assessment to any `studentId`.
2. P1-02 — `scheduleInterview` writes interview data onto DECLINED applications.
3. P1-03 — `ensureTeacherOwnsClassroom` blocks timetable-assigned subject teachers.
4. P1-04 — `applyDiscount` stale read can overwrite correct invoice status.

---

## P2 — Polish

### P2-01 · `NotificationStrip.resolveParentLink` silently routes unknown links to dashboard
**File:** `app/parent/dashboard/_components/NotificationStrip.tsx:156-163`
**Issue:** Final fallback `return '/parent/dashboard'` swallows any link that
doesn't match an explicit prefix. The "Open" button is rendered whenever
`n.link` is truthy, so future notification kinds with unmatched prefixes will
silently produce broken "Open" buttons. Current kinds are fine.
**Fix:** Add a comment listing the expected prefixes so future contributors
know to extend the function, or hide the "Open" button when the resolver
falls back.

### P2-02 · `applyDiscount` does not revalidate parent fee surface
**File:** `app/(app)/fees/_actions.ts:231-233`
**Issue:** After applying a discount, `/parent/kids/${studentId}/fees` keeps
the old outstanding balance until the cache TTL expires. If a parent checks
fees immediately after a sibling-discount is applied, they see the wrong
total.
**Fix:** Add `revalidatePath('/parent', 'layout')` and the per-student fees
path (requires adding `studentId` to the invoice `select`).

### P2-03 · `nextRollNoStart` lex-sort bug (cross-reference)
Documented as part of P0-02 Bug 2 above. Listed separately for the import
import path so it is fixed in lockstep.

### P2-04 · Import pad-width inconsistency (cross-reference)
Documented as part of P0-02 Bug 3 above.

---

## Summary

| | Count |
|---|---|
| **Total actionable issues** | 10 |
| **P0 — Critical** | 2 |
| **P1 — Important** | 4 |
| **P2 — Polish** | 4 |

Fixes applied in Phase 2 of this round: every P0 and P1, plus P2-02
(parent revalidation on discount). P2-01 and P2-03/P2-04 cross-references
addressed via P0-02 fix.
