# Portal audit (round 2) — 2026-05-21

Focused review of the modules added on 2026-05-20: Parent portal, Homework,
Report cards, Notifications, Timetable + Subjects/Periods, Staff attendance,
Year-end promotion, UploadThing scaffold. Round 1 findings (`AUDIT.md`) are
not repeated here.

## Severity legend

| Tier | Meaning |
|------|---------|
| **P0 — Critical** | Must fix before any real user touches the system. Data leaks, money inconsistencies, or loss of records. |
| **P1 — Important** | Should be resolved before a production pilot. Broken workflows or misleading data that will confuse or block real users. |
| **P2 — Polish** | Low-risk quality issues. Fix during normal iteration. |

---

## P0 — Critical

### P0-01 · Homework notification deep-link points at a route that does not exist
**File:** `app/(app)/homework/_actions.ts:163`
**Issue:** `createHomework` sends `link: '/parent/homework/${created.id}'`, but no `/parent/homework/[id]` route exists anywhere in the app tree. When a parent clicks the notification or its dashboard "Open" button, NotificationBell calls `router.push` to that URL, which renders the 404 page (middleware also intercepts `/homework` for parents and redirects them away). Every homework notification is therefore a dead click.
**Fix:** Point the link at a real parent surface — the per-child homework page: `/parent/kids/<studentId>/homework`. Because a homework post belongs to a classroom (not a single child), fan out one notification per parent **with the relevant child id baked into the link** when we resolve the parents from enrollments. Update `notifyClassroomParents` (or supply a per-recipient link override) so each row carries the right `/parent/kids/<studentId>/homework` link.

### P0-02 · `lib/uploadthing.ts` `uploadthingEnabled` always false on the client
**File:** `lib/uploadthing.ts:19`
**Issue:** The constant reads `process.env.UPLOADTHING_TOKEN` — a server-only env var. Next.js only inlines variables prefixed with `NEXT_PUBLIC_` into the client bundle, so on the client `process.env.UPLOADTHING_TOKEN` is `undefined`, making `uploadthingEnabled` always `false` in any browser bundle. Result: even with `UPLOADTHING_TOKEN` set, the Uploader component permanently shows the URL fallback in production — the UploadThing widget is unreachable from the browser.
**Fix:** Drive the boolean from a public env var (`NEXT_PUBLIC_UPLOADTHING_ENABLED`) that the deploy environment sets when the token is configured. Alternatively, accept the flag as a prop fetched from the server. Either way, do not rely on a non-public env var in code that runs on both sides of the RSC boundary.

---

## P1 — Important

### P1-01 · `bulkUpdate` attendance does not fire absence notifications
**File:** `app/(app)/attendance/_actions.ts:230-257`
**Issue:** Single-row `markAttendance` notifies parents on ABSENT; the bulk path used by the "save all marks at once" flow does not. A teacher who edits a roster via the bulk-edit action can mark a dozen kids absent and zero notifications fire. The two paths are equivalent from the user's perspective so the behaviour should match.
**Fix:** After the transaction commits in `bulkUpdate`, fan out absence notifications for every row whose new status is ABSENT (and whose prior status was not ABSENT — re-marking ABSENT should not double-send). Best-effort, same try/catch wrapper as the single-mark path.

### P1-02 · Parent topbar bell does not decrement after mark-as-read on the dashboard
**File:** `components/layout/ParentTopBar.tsx:99-109`, `app/parent/_actions.ts:14-32`
**Issue:** The parent topbar bell shows `unreadCount` from the server (passed in via props from `ParentLayout`). When the user marks a notification read from the dashboard strip via `markNotificationRead`, the action calls `revalidatePath('/parent/dashboard')` only — the layout doesn't revalidate, so the badge stays put until a full nav. Admins get this right because the admin TopBar `NotificationBell` calls `loadNotifications()` to refresh; the parent bell does not.
**Fix:** Add `revalidatePath('/parent', 'layout')` to both `markNotificationRead` and `markAllNotificationsRead` so the layout-level fetch of unread count re-runs. (Belt-and-braces: the parent dashboard already revalidates the page; we just need the layout too.)

### P1-03 · Announcement notification link `/notifications` is admin-only — parents land on dashboard
**File:** `app/(app)/settings/announcements/_actions.ts:75`
**Issue:** All audience fan-outs send `link: '/notifications'`. Middleware blocks PARENT from `/notifications` and redirects to `/parent/dashboard`. The dashboard's `NotificationStrip` already special-cases this by mapping `/announcements`-prefixed links to `/parent/announcements`, but the literal `/notifications` link slips through and defaults to `/parent/dashboard` — which is fine but uninformative: the parent expected to land on an announcement detail or list.
**Fix:** Use a smarter default link per audience: `PARENTS_ONLY` and `CLASSROOM` audiences → `/parent/announcements`; `STAFF_ONLY` → `/notifications`; `ALL` → split the fan-out so PARENT recipients get `/parent/announcements` and staff get `/notifications`.

### P1-04 · `previewPromotion` does not validate source/target year ownership of classrooms
**File:** `app/(app)/settings/promotion/_actions.ts:204-256`
**Issue:** `previewPromotion` accepts any classroom id and looks up its row, but never checks that each source classroom belongs to `sourceYearId` (it filters via `where: { id: { in: sourceIds }, academicYearId: parsed.data.sourceYearId }`, which **silently drops** mismatched rows from the result). A user crafting a request with a wrong-year classroom gets a misleading "(missing source)" row in the preview, and they could then submit the same crafted plan to `commitPromotion` — which does validate, but the misleading preview is itself a footgun. Preview should reject explicitly.
**Fix:** After running the lookups, compare `sourceRooms.length === sourceIds.length`. If not, return `{ ok: false, error: 'A source classroom does not belong to the source year.' }`. Same check for target rooms (only when there's at least one `move` mapping with a target).

### P1-05 · Homework edit form does not redirect / give visible feedback on success
**File:** `app/(app)/homework/_actions.ts:179-277`, `components/data/HomeworkForm.tsx:64-83`
**Issue:** `updateHomework` returns `{ ok: true, id }` but the form never reads it: the page stays in `?edit=1` mode with the same defaults, and the user has no signal that the save succeeded. (Create works because `createHomework` calls `redirect`.) A teacher hitting Save sees no toast, no redirect, no visible state change.
**Fix:** Either `redirect(\`/homework/${id}\`)` at the end of `updateHomework` (matching the create path), OR have the form effect-watch `state.ok` and `router.replace` to the non-edit URL plus a toast.

### P1-06 · Subject `code` uniqueness check passes when `code` is left blank in seed
**File:** `app/(app)/settings/subjects/_actions.ts:40-51, 107-116`
**Issue:** When a user creates two subjects without codes (`code: null`), Prisma's `where: { code: data.code }` is called with `data.code === undefined`. `findUnique` returns `null` and the create proceeds. That's actually correct behavior here, but the underlying schema's unique index permits multiple NULL `code` values, so this isn't really a bug — flagged only because the audit log diff records `code: null` and the UI says "Code is required for uniqueness" when this isn't the case. Cosmetic.
*Downgrading to P2 on re-read — leaving here as a note only.*

### P1-07 · Promotion `commitPromotion` updates student status to GRADUATED but never revalidates the student detail layout
**File:** `app/(app)/settings/promotion/_actions.ts:440-444`
**Issue:** Only `/students` (list) is revalidated, not `/students/[id]`. After running promotion, every student detail page still says "Active" because the per-student Server Component caches an `ACTIVE` status. Same applies to all the parent surfaces.
**Fix:** Add `revalidatePath('/students', 'layout')` and `revalidatePath('/parent', 'layout')` after the transaction.

### P1-08 · `notifyClassroomParents` writes one notification per parent — but does not pass a child-aware link
**File:** `lib/notify.ts:78-114`
**Issue:** The helper takes a flat `payload` and uses the same `link` for every recipient. For per-classroom notifications that should deep-link to a specific child page (homework, attendance), we need the link to vary per recipient — `link: '/parent/kids/${theirStudentId}/...'`. Today every parent gets the same link, which only works when the link doesn't reference a student id.
**Fix:** Change the signature to accept an optional `linkFor(studentId)` builder, OR have the caller compute one notification row per (parent, child) pair via direct `notifyUsers` calls. Used together with P0-01.

### P1-09 · Parent portal sidebar shows numeric "01 02 03" badges that don't reflect role-aware sections
**File:** `components/layout/ParentSidebar.tsx:73, 119`
**Issue:** Cosmetic, but the inline numbering becomes "03 — Announcements" when a parent has kids, and "02 — Announcements" when they don't. Sectioning is fine; the inconsistency is fine to live with, but if a parent has zero kids the dashboard still shows "Your child" header header chrome. Confirmed: when `kids.length === 0`, the children block is skipped (good). No fix needed.
*Removing — non-issue on closer read.*

### P1-10 · Notifications page is reachable by PARENT through direct URL click in dashboard NotificationStrip
**File:** `app/parent/dashboard/_components/NotificationStrip.tsx:159-162`
**Issue:** `resolveParentLink` swallows `/notifications` into `/parent/dashboard` (good) — but several places in code still write `link: '/notifications'` for ANNOUNCEMENT notifications, and `link: '/fees'` etc. For PARENT users this is a no-op (middleware bounces). However, for non-parent users on the `/notifications` page, clicking an ANNOUNCEMENT link routes to `/notifications` itself (current page) — no movement. Mild UX.
**Fix:** When the announcement fan-out builds the payload, use `link: '/settings/announcements'` for staff audiences (so they can edit/pin), and `/parent/announcements` for parent audiences. See P1-03 above.

### P1-11 · TimetableGrid mobile day chips assume Mon-Fri/Sat only — Sunday is silently absent
**File:** `components/data/TimetableGrid.tsx:108-112`
**Issue:** `dayChips` is `[1..5]` or `[1..6]`. The day-of-week field allows 1–7 in the schema (`Int @db.SmallInt` with no constraint). If anyone creates a Sunday timetable entry via raw SQL, it will exist in the data but not be reachable through the UI. Not user-facing because the UI never offers `7` as an option to write. Defensive only — not a real bug today.
*Removing — non-issue.*

### P1-12 · Staff attendance UI lets you select a Sunday but provides no warning / weekend handling
**File:** `app/(app)/staff-attendance/page.tsx:33-37`, `components/data/StaffAttendanceGrid.tsx`
**Issue:** Picking a Sunday or holiday in the date picker still loads the full staff roster and marks attendance. There's nothing wrong with this (school might have weekend operations), but combined with the "Mark all present" affordance it makes it easy to accidentally mark Sunday attendance for a Mon–Sat school. No fix required — flagged as P2.

---

## P1 (curated, final list)

After deduplication and removing the items marked as non-issues above, the
actionable P1 set is:

1. P1-01 — bulkUpdate attendance does not fire ABSENT notifications.
2. P1-02 — Parent topbar bell stale after mark-as-read.
3. P1-03 — Announcement notification link `/notifications` for parents.
4. P1-04 — `previewPromotion` does not reject cross-year classroom ids.
5. P1-05 — Homework edit form has no visible success feedback.
6. P1-07 — `commitPromotion` does not revalidate student detail / parent layouts.
7. P1-08 — `notifyClassroomParents` cannot supply per-recipient links (fix together with P0-01).

---

## P2 — Polish

### P2-01 · Homework table stores subject NAME, not subject id
**File:** `prisma/schema.prisma`, `app/(app)/homework/_actions.ts:113`
**Issue:** When an admin renames a Subject from "Maths" to "Mathematics", every historical homework row still says "Maths". Cosmetic at this stage; would matter for reporting later. Schema change required — out of scope this round.

### P2-02 · Staff attendance roster does not flag weekends
**File:** `app/(app)/staff-attendance/page.tsx`
**Issue:** Picking a Sunday loads the same roster — no banner / warning. Cosmetic. Could surface a "Weekend — likely closed" hint above the grid.

### P2-03 · `getChildHomework` orders by dueDate DESC then postedAt DESC — past homework above upcoming
**File:** `lib/queries/parent.ts:758`
**Issue:** The page filters upcoming/past after the fact, so ordering by dueDate DESC works for the past list but puts farthest-in-the-future first in the upcoming list. The dashboard's `upcomingHomework` orders ascending; this page should too. Mild.

### P2-04 · ChildHeader "Grades" tab label is "Grades" even for Montessori students
**File:** `app/parent/kids/[studentId]/_components/ChildHeader.tsx:93`
**Issue:** Montessori kids don't have grades — they have observations. The tab label could read "Progress" or "Observations" when `programKind` is an early-years kind. Tiny.

### P2-05 · `notifyRoles` includes the actor when an admin posts ALL/STAFF announcements
**File:** `app/(app)/settings/announcements/_actions.ts:79-110`
**Issue:** The author also gets the broadcast notification on top of the explicit "Announcement posted" self-poke. Two notifications for the author. Cosmetic.

### P2-06 · Parent dashboard `formatDate(...).toUpperCase()` on a localised string is locale-fragile
**File:** `app/parent/dashboard/page.tsx:284-288`
**Issue:** Calling `toUpperCase()` on a string like "May 21" is fine in en-PK but could behave weirdly in some locales. Cosmetic.

### P2-07 · `getChildTimetable` returns periods for every dayOfWeek; UI relies on `dayShort[d]` keyed by day number — Sundays would crash
**File:** `app/parent/kids/[studentId]/timetable/page.tsx:17-18`
**Issue:** Same as P1-11 above — defensive only.

### P2-08 · Promotion preview shows "(missing source)" / "(missing target)" placeholder when a classroom isn't in the expected year
**File:** `app/(app)/settings/promotion/_actions.ts:248`
**Issue:** Confusing UX — see P1-04 for the real fix. Once that lands, the placeholder text becomes unreachable.

### P2-09 · `TimetableGrid` desktop view uses `table-fixed` with a single 160px first column — many classrooms on a small screen scroll horizontally
**File:** `components/data/TimetableGrid.tsx:280`
**Issue:** On tablet sizes (md = 768–1023px) the desktop grid kicks in with 6 day columns plus 160px period column. The container scrolls horizontally inside the page — works, but cramped.

### P2-10 · Notifications "Most active" KPI tile recomputes the max three times
**File:** `app/(app)/notifications/page.tsx:96-123`
**Issue:** Cosmetic — readability. Could compute once into a const.

---

## Summary

| | Count |
|---|---|
| **Total actionable issues** | 19 |
| **P0 — Critical** | 2 |
| **P1 — Important** | 7 |
| **P2 — Polish** | 10 |

Fixes applied in Phase 2 of this round: every P0 and P1 listed above.
