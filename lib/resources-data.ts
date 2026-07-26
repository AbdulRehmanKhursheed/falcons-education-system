/**
 * ─── SYLLABUS & DATE SHEETS — ONE FILE TO UPDATE EVERYTHING ──────────────
 * Everything on the /syllabus page comes from this file.
 *
 * HOW TO ADD A FILE
 * 1. Put the PDF in the folder:  public/files/
 *    (use simple names, no spaces — e.g. syllabus-2026-class-3.pdf)
 * 2. Add or edit a line below and set `file` to the path:
 *      { title: 'Class 3 — Syllabus', file: '/files/syllabus-2026-class-3.pdf' }
 * 3. If the file is not ready yet, just leave `file` out. The page will show
 *    "Coming soon" instead of a broken link.
 *
 * HOW TO ADD A NEW YEAR
 * Copy a whole { year: '...', docs: [...] } block, change the year, and put
 * it at the TOP of the list. Set `current: true` on the newest year only.
 * Old years stay on the page under "Previous years" — nothing is deleted.
 * ──────────────────────────────────────────────────────────────────────────
 */

export type ResourceDoc = {
  title: string;
  /** Path inside public/, e.g. '/files/syllabus-2026-class-1.pdf'. Omit if not ready. */
  file?: string;
  /** Optional small note shown under the title, e.g. 'Updated 12 August'. */
  note?: string;
};

export type ResourceYear = {
  year: string;
  /** true for the running session — shown at the top, highlighted. */
  current?: boolean;
  docs: ResourceDoc[];
};

export const RESOURCES = {
  /** Short line under the page heading. */
  intro:
    'Course outlines and exam date sheets for every class. Older years stay here too, so you can always look back.',

  syllabus: [
    {
      year: '2026',
      current: true,
      docs: [
        { title: 'Play Group, Nursery & KG — Syllabus' },
        { title: 'Class 1 & 2 — Syllabus' },
        { title: 'Class 3 & 4 — Syllabus' },
        { title: 'Class 5 & 6 — Syllabus' },
      ],
    },
    {
      year: '2025',
      docs: [
        { title: 'Play Group, Nursery & KG — Syllabus' },
        { title: 'Class 1 & 2 — Syllabus' },
        { title: 'Class 3 & 4 — Syllabus' },
        { title: 'Class 5 & 6 — Syllabus' },
      ],
    },
  ] as ResourceYear[],

  dateSheets: [
    {
      year: '2026',
      current: true,
      docs: [
        { title: 'First Term Exams — Date Sheet' },
        { title: 'Mid-Term Exams — Date Sheet' },
        { title: 'Final Exams — Date Sheet' },
      ],
    },
    {
      year: '2025',
      docs: [
        { title: 'First Term Exams — Date Sheet' },
        { title: 'Mid-Term Exams — Date Sheet' },
        { title: 'Final Exams — Date Sheet' },
      ],
    },
  ] as ResourceYear[],
};
