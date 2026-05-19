# Portal audit — 2026-05-19

## Severity legend

| Tier | Meaning |
|------|---------|
| **P0 — Critical** | Must fix before any real user touches the system. Data leaks, money inconsistencies, or loss of records. |
| **P1 — Important** | Should be resolved before a production pilot. Broken workflows or misleading data that will confuse or block real users. |
| **P2 — Polish** | Low-risk quality issues. Fix during normal iteration. |

---

## P0 — Critical

### P0-01 · `/api/search` returns all data to every role including PARENT
**File:** `app/api/search/route.ts:49`
**Issue:** `requireSession()` lets any authenticated user query students/invoices/applications. A parent can see classroom rosters, invoice totals, applicant phone numbers.
**Fix:** Branch queries on role. PARENT → empty. ACCOUNTANT → invoices only. TEACHER → students in their homeroom classrooms only. Admin roles → full payload.

### P0-02 · `loadClassroomDay` leaks attendance to PARENT role
**File:** `app/(app)/attendance/_actions.ts:247`
**Issue:** PARENT in the allowed role list. Replay the action with any `classroomId` → full roster leak.
**Fix:** Drop `'PARENT'` from the `requireRole` array.

### P0-03 · `/attendance/print` uses `requireSession()` — anyone can print any roster
**File:** `app/(app)/attendance/print/page.tsx:30`
**Issue:** No role check; the `classroom` param isn't validated against the requester.
**Fix:** `requireRole(['SUPER_ADMIN','SCHOOL_ADMIN','TEACHER','ACCOUNTANT'])`. For TEACHER, verify the classroom is one of their homerooms.

### P0-04 · `generateMonthlyInvoices` is non-atomic
**File:** `app/(app)/fees/_actions.ts:306-343`
**Issue:** Sequence read once outside the loop; each invoice created individually; no rollback on partial failure; race condition on concurrent admin clicks.
**Fix:** Wrap in `db.$transaction(async (tx) => { ... })`. Batch via `tx.invoice.createMany`. Compute sequence inside the transaction.

### P0-05 · Roll number race + lexicographic-sort bug
**Files:** `app/(app)/students/[id]/_actions.ts:180`, `app/(app)/admissions/[id]/_actions.ts:283`
**Issue:** `nextRollNo()` runs before the transaction; two concurrent creates produce the same number → unique constraint crash. `orderBy: { rollNo: 'desc' }` on a string sorts `FES-2026-1000` before `FES-2026-999`.
**Fix:** Move `nextRollNo()` inside the transaction. Pad numeric suffix to at least 4 digits.

### P0-06 · `convertToStudent` silently substitutes today's date when DOB is null
**File:** `app/(app)/admissions/[id]/_actions.ts:295`
**Issue:** `const dob = app.dateOfBirth ?? new Date()` — student record gets today as their birthday. Silent data corruption.
**Fix:** Return `{ ok: false, error: 'Date of birth required — edit the application first.' }` when DOB is null.

### P0-07 · `moveStage` permits ENROLLED → RECEIVED
**File:** `app/(app)/admissions/_actions.ts:16-41`
**Issue:** Any-to-any transition allowed. Reverse moves orphan the linked student record. Audit diff omits `prevStage`.
**Fix:** Validate against a legal transition map. Reject illegal moves with a user-friendly error. Log `{ prevStage, newStage }`.

---

## P1 — Important

### P1-01 · Dead "Add student" + "Export" buttons on `/students`
**File:** `app/(app)/students/page.tsx:43-57`
**Fix:** Convert "Add student" to `<Link href="/students/new">`. Wire "Export" to call `bulkExportCsv` over the current row set, or hide it until selection exists.

### P1-02 · Dead "New application" + "Filter" buttons on `/admissions`
**File:** `app/(app)/admissions/page.tsx`
**Fix:** "New application" → `<Link href="/admissions/new">`. Hide "Filter" or wire to the stage chips below.

### P1-03 · Dashboard Announcements panel is hardcoded
**File:** `app/(app)/dashboard/page.tsx:191-221`
**Issue:** Three fixed `<li>` elements with stale dates. Real announcements in the DB never appear.
**Fix:** Add `getActiveAnnouncements()` query (filter expired, order pinned DESC then createdAt DESC, limit 5). Render empty state.

### P1-04 · `convertToStudent` doesn't navigate to the new student
**File:** `app/(app)/admissions/[id]/_actions.ts:386`
**Fix:** Call `redirect(`/students/${studentId}`)` at the end of the action.

### P1-05 · CommandPalette nav shortcuts ignore role
**Files:** `components/layout/CommandPalette.tsx:168-184`, `lib/nav.ts:70`
**Fix:** Add `filterByRole(role)` to `lib/nav.ts`. Pass session role into CommandPalette as a prop. Filter `navHits` accordingly.

### P1-06 · `en-IN` locale on PKR formatting (lakh grouping)
**Files:** `components/layout/CommandPalette.tsx:78`, `app/(app)/fees/_actions.ts:97`
**Fix:** Use `lib/format.ts` `formatPKR` everywhere; replace any local `en-IN` calls with `en-PK`.

### P1-07 · `bulkUpdate` attendance audit log written outside the transaction
**File:** `app/(app)/attendance/_actions.ts:199-227`
**Fix:** Move `tx.auditLog.create` inside an interactive `db.$transaction(async (tx) => { ... })`.

### P1-08 · UsersManager role change has no confirmation
**File:** `app/(app)/settings/users/UsersManager.tsx:73-82`
**Fix:** Add `confirm('Change role to X?')` at the top of `handleRoleChange`. Match the deactivate handler.

### P1-09 · `generateMonthlyInvoices` doesn't revalidate student detail pages
**File:** `app/(app)/fees/_actions.ts:355`
**Fix:** Add `revalidatePath('/students', 'layout')` after the loop.

### P1-10 · `/attendance` accessible to PARENT
**File:** `app/(app)/attendance/page.tsx:37`
**Fix:** Replace `requireSession()` with `requireRole(['SUPER_ADMIN','SCHOOL_ADMIN','TEACHER','ACCOUNTANT'])`.

---

## P2 — Polish

### P2-01 · "Good morning" is hardcoded
**File:** `app/(app)/dashboard/page.tsx:59`
**Fix:** Time-of-day greeting based on Asia/Karachi hour.

### P2-02 · Dead "Open school calendar" button
**File:** `app/(app)/dashboard/page.tsx:214`
**Fix:** Hide until a calendar exists, OR repoint at `/settings/announcements`.

### P2-03 · Dead "Export" on student detail
**File:** `app/(app)/students/[id]/page.tsx`
**Fix:** Wire to `bulkExportCsv([studentId])` with a client-side download trigger.

### P2-04 · Roll-number sort bug at 1000+ students
Covered by P0-05.

### P2-05 · `getStudents` classroom filter matches across academic years
**File:** `lib/queries/students.ts:65-71`
**Fix:** Add `classroom: { academicYear: { isCurrent: true } }` OR filter by classroom ID.

### P2-06 · `getTodayKpis` enrollment count not scoped to current year
**File:** `lib/queries/attendance.ts:63`
**Fix:** Add `classroom: { academicYear: { isCurrent: true } }`.

### P2-07 · Fee challan uses hardcoded SCHOOL constant
**File:** `app/(app)/fees/[invoiceId]/challan/page.tsx:12-18`
**Fix:** Import from `lib/school-config.ts`.

### P2-08 · `duesTrend` KPI delta is always green
**File:** `app/(app)/dashboard/page.tsx:97`
**Fix:** Rename to `recentCollections` (always positive). Suffix: "collected last 30d".

### P2-09 · `getApplications` has no pagination
**File:** `lib/queries/admissions.ts`
**Fix:** Add `take`/`skip` + `total` count.

### P2-10 · `attendanceTrend` KPI hardcoded to 0
**File:** `lib/queries/dashboard.ts` `getKpis`
**Fix:** Compute 7-day prior-average and return signed delta.

---

## Summary

| | Count |
|---|---|
| **Total issues** | 27 |
| **P0 — Critical** | 7 |
| **P1 — Important** | 10 |
| **P2 — Polish** | 10 |
