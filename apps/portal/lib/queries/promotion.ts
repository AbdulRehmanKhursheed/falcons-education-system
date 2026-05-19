/**
 * Year-end promotion queries.
 *
 * The flow needs three reads:
 *   - the list of academic years (source + target dropdown)
 *   - source classrooms with active enrollment counts (the "what's moving" table)
 *   - target classrooms (the "where are we sending them" dropdowns)
 */

import { db } from '@/lib/db';
import type { ProgramKind } from '@prisma/client';

const programOrder: Record<ProgramKind, number> = {
  NURSERY: 0,
  MONTESSORI: 1,
  KINDERGARTEN: 2,
  PRIMARY: 3,
  EVENING_COACHING: 4,
  SATURDAY_COACHING: 5,
  COMPUTER_COURSE: 6,
};

function sortClassrooms<
  T extends { name: string; programKind: ProgramKind },
>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const pa = programOrder[a.programKind] ?? 99;
    const pb = programOrder[b.programKind] ?? 99;
    if (pa !== pb) return pa - pb;
    return a.name.localeCompare(b.name, undefined, { numeric: true });
  });
}

// ── Academic years ─────────────────────────────────────────────────────────

export type PromotionYearOption = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  classroomCount: number;
};

export async function getAcademicYears(): Promise<PromotionYearOption[]> {
  const rows = await db.academicYear.findMany({
    orderBy: [{ startDate: 'desc' }],
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      isCurrent: true,
      _count: { select: { classrooms: true } },
    },
  });

  return rows.map((y) => ({
    id: y.id,
    name: y.name,
    startDate: y.startDate.toISOString(),
    endDate: y.endDate.toISOString(),
    isCurrent: y.isCurrent,
    classroomCount: y._count.classrooms,
  }));
}

// ── Source classrooms ──────────────────────────────────────────────────────

export type SourceClassroom = {
  id: string;
  name: string;
  programKind: ProgramKind;
  /** Count of enrollments that are still active (withdrawnAt == null). */
  activeStudentCount: number;
};

export async function getSourceClassroomsWithCounts(
  yearId: string,
): Promise<SourceClassroom[]> {
  const rows = await db.classroom.findMany({
    where: { academicYearId: yearId },
    select: {
      id: true,
      name: true,
      programKind: true,
      _count: { select: { enrollments: { where: { withdrawnAt: null } } } },
    },
  });

  return sortClassrooms(
    rows.map((c) => ({
      id: c.id,
      name: c.name,
      programKind: c.programKind,
      activeStudentCount: c._count.enrollments,
    })),
  );
}

// ── Target classrooms ──────────────────────────────────────────────────────

export type TargetClassroom = {
  id: string;
  name: string;
  programKind: ProgramKind;
};

export async function getTargetClassrooms(
  yearId: string,
): Promise<TargetClassroom[]> {
  const rows = await db.classroom.findMany({
    where: { academicYearId: yearId },
    select: {
      id: true,
      name: true,
      programKind: true,
    },
  });

  return sortClassrooms(rows);
}

// ── Default mapping suggestions ────────────────────────────────────────────

/**
 * Suggest a default mapping for each source classroom.
 *
 * The convention:
 *   - "Class N" → "Class N+1" (where the target year has it)
 *   - "Class 6" → graduate (the highest grade in the primary section)
 *   - NURSERY → MONTESSORI / KINDERGARTEN if it exists, otherwise skip
 *   - Coaching / computer-course rooms default to skip (those are open
 *     enrolment programs that don't promote year-on-year)
 */
export function suggestDefaultMapping(
  source: SourceClassroom,
  targets: TargetClassroom[],
): { action: 'move' | 'graduate' | 'skip'; targetClassroomId?: string } {
  // Class 6 graduates out of the school.
  if (source.programKind === 'PRIMARY') {
    const num = parseClassNumber(source.name);
    if (num !== null) {
      if (num >= 6) {
        return { action: 'graduate' };
      }
      const nextName = `Class ${num + 1}`;
      const match = targets.find((t) => t.name === nextName);
      if (match) {
        return { action: 'move', targetClassroomId: match.id };
      }
    }
    // Fallback: same-name room in the new year (e.g. "Class 1" was duplicated).
    const sameName = targets.find(
      (t) => t.name === source.name && t.programKind === 'PRIMARY',
    );
    if (sameName) {
      return { action: 'move', targetClassroomId: sameName.id };
    }
    return { action: 'skip' };
  }

  // Coaching / computer-course rooms don't follow the year-on-year promotion
  // model — admins can manually override if needed.
  if (
    source.programKind === 'EVENING_COACHING' ||
    source.programKind === 'SATURDAY_COACHING' ||
    source.programKind === 'COMPUTER_COURSE'
  ) {
    return { action: 'skip' };
  }

  // Early-years: try same-name room first, then the next program tier.
  const sameName = targets.find(
    (t) => t.name === source.name && t.programKind === source.programKind,
  );
  if (sameName) {
    return { action: 'move', targetClassroomId: sameName.id };
  }

  const tierProgression: Record<ProgramKind, ProgramKind | null> = {
    NURSERY: 'MONTESSORI',
    MONTESSORI: 'KINDERGARTEN',
    KINDERGARTEN: 'PRIMARY',
    PRIMARY: 'PRIMARY',
    EVENING_COACHING: null,
    SATURDAY_COACHING: null,
    COMPUTER_COURSE: null,
  };
  const nextTier = tierProgression[source.programKind];
  if (nextTier) {
    const candidate = targets.find((t) => t.programKind === nextTier);
    if (candidate) {
      return { action: 'move', targetClassroomId: candidate.id };
    }
  }

  return { action: 'skip' };
}

function parseClassNumber(name: string): number | null {
  const match = name.match(/(\d+)/);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}
