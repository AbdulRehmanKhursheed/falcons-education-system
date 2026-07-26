/**
 * ─── COACHING ACADEMY — ONE FILE TO UPDATE EVERYTHING ────────────────────
 * Principal/staff: everything on the /coaching page comes from this file.
 * Edit the text below (or tell Claude what changed) — nothing else on the
 * website needs to be touched.
 *
 * course status options:  "open"  |  "starting-soon"  |  "full"
 * To add a notice: copy one { date, title, text } block and edit it.
 * Newest notices show first — just add new ones at the TOP of the list.
 * ──────────────────────────────────────────────────────────────────────────
 */

export const COACHING = {
  // Master switch shown as a badge at the top of the page
  admissionsOpen: true,
  admissionBadge: 'Coaching admissions open — limited seats per group',

  // Daily timings — shown in the "Timings" card
  timings: [
    { label: 'Evening Coaching (Play Group – Matric)', value: 'Mon – Sat · 3:30 – 7:00 PM' },
    { label: 'Closing time', value: '7:00 PM' },
    { label: 'Sunday', value: 'Closed' },
  ],

  // Notice board — newest first. Parents see these at the top of the page.
  notices: [
    {
      date: '2026-07-26',
      title: 'Admissions open for the Evening Coaching Academy',
      text: 'Seats for the new session are open for children from Play Group up to Matriculation — from any school. Message us on WhatsApp or visit any evening to enrol.',
    },
  ],

  // THE ACADEMY — the main evening coaching plan (one plan, one fee)
  academy: [
    {
      name: 'Evening Coaching — Play Group to Matric',
      status: 'open' as const,
      timing: 'Mon – Sat · 3:30 – 7:00 PM',
      description:
        'Homework help, subject coaching and exam preparation for children from any school — small groups, arranged by level.',
    },
  ],

  // SHORT COURSES — separate from the academy: apni alag admission,
  // apna alag plan aur fee. Batch timings yahan update karo.
  shortCoursesNote:
    'These are separate courses with their own admission and fee — not part of the Evening Coaching plan. A child can join a course, the academy, or both.',
  shortCourses: [
    {
      name: 'Spoken English',
      status: 'open' as const,
      timing: 'Separate batches — current timings on WhatsApp',
      description:
        'Complete English confidence for school-age children — daily conversation practice with the teacher and classmates, so speaking English becomes normal, not scary.',
      highlights: [
        'Daily conversation practice',
        'Listening & comprehension',
        'Writing practice',
        'Spelling & vocabulary memorization',
        'Speaking opportunities — presentations & role-play',
      ],
    },
    {
      name: 'Computer Course for Kids',
      status: 'open' as const,
      timing: 'Separate batches — current timings on WhatsApp',
      description:
        'From first click to first program — hands-on computer skills for young students, taught on real machines.',
      highlights: [
        'Basic computer knowledge & typing',
        'MS Word',
        'MS PowerPoint',
        'MS Excel',
        'Graphic designing',
        'Introduction to programming',
        'Internet fundamentals',
      ],
    },
  ],

  // SESSION & ADMISSION DETAILS — the block parents check before coming.
  // Update dates/lines here whenever a new session or batch is announced.
  session: {
    name: 'Session 2026',
    status: 'Enrolment open — seats filling by level',
    enrolWhen: 'Any evening during academy hours, Monday to Saturday',
    whoCanJoin: 'Children from Play Group up to Matric — from anywhere',
    documents: 'No documentation required.',
  },

  // How to get admission — the steps parents ask about on the phone
  admission: {
    steps: [
      'Message us on WhatsApp or call 0311-9911288 — tell us the child’s class and school',
      'Bring the child any evening for a short level check — free, no test pressure',
      'Enrol the same day',
    ],
    feeNote:
      'Fees differ by class level and are shared on WhatsApp or at the academy — written, complete, before you enrol.',
  },
};
