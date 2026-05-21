/**
 * Notification helpers — central place to write Notification rows. Other
 * modules call these helpers instead of touching db.notification directly,
 * so the surface area for changes (schema, batching, future fan-out via
 * email/SMS) lives in one file.
 *
 * Every helper here is best-effort: failures are caught and logged. We never
 * let a notification write break the caller — the user's action (recording
 * a payment, marking attendance, etc.) must succeed even if the notification
 * insert blows up.
 */

import { db } from '@/lib/db';
import type { NotificationKind, Role } from '@prisma/client';

type Payload = {
  kind: NotificationKind;
  title: string;
  body?: string;
  link?: string;
};

/**
 * Insert a single notification. Safe — never throws.
 */
export async function createNotification(
  input: Payload & { userId: string },
): Promise<void> {
  try {
    await db.notification.create({
      data: {
        userId: input.userId,
        kind: input.kind,
        title: input.title,
        body: input.body,
        link: input.link,
      },
    });
  } catch (err) {
    console.warn('[notify] createNotification failed', err);
  }
}

/**
 * Insert one notification per user via createMany. Duplicates are silently
 * skipped (there's no unique constraint today but skipDuplicates is a cheap
 * future-proofing).
 */
export async function notifyUsers(
  userIds: string[],
  input: Payload,
): Promise<void> {
  const unique = Array.from(new Set(userIds.filter(Boolean)));
  if (unique.length === 0) return;
  try {
    await db.notification.createMany({
      data: unique.map((userId) => ({
        userId,
        kind: input.kind,
        title: input.title,
        body: input.body,
        link: input.link,
      })),
      skipDuplicates: true,
    });
  } catch (err) {
    console.warn('[notify] notifyUsers failed', err);
  }
}

/**
 * Look up every parent linked to a student enrolled in `classroomId` and
 * fan a notification out to each of their user accounts. Guardians without
 * a linked userId (e.g. parents who don't yet have a portal login) are
 * skipped silently — they'll see the announcement when their account is
 * provisioned, but we don't error out the calling action.
 *
 * Optionally accepts a `linkFor(studentId)` builder so callers can include
 * a per-recipient deep link (e.g. `/parent/kids/<id>/homework`). When the
 * builder is omitted, every recipient gets the static `input.link`. Note
 * that one parent linked to multiple kids in the same classroom will see
 * one notification per child — that's intentional, so each row's deep link
 * targets the correct kid page.
 */
export async function notifyClassroomParents(
  classroomId: string,
  input: Payload,
  opts?: { linkFor?: (studentId: string) => string },
): Promise<void> {
  try {
    const enrollments = await db.enrollment.findMany({
      where: { classroomId, withdrawnAt: null },
      select: {
        studentId: true,
        student: {
          select: {
            guardians: {
              select: { guardian: { select: { userId: true } } },
            },
          },
        },
      },
    });

    if (enrollments.length === 0) {
      console.warn(
        `[notify] notifyClassroomParents: no enrollments for classroom ${classroomId}`,
      );
      return;
    }

    // No per-recipient link → cheaper batched insert.
    if (!opts?.linkFor) {
      const userIds: string[] = [];
      for (const e of enrollments) {
        for (const sg of e.student.guardians) {
          if (sg.guardian.userId) userIds.push(sg.guardian.userId);
        }
      }
      if (userIds.length === 0) {
        console.warn(
          `[notify] notifyClassroomParents: no linked parent users for classroom ${classroomId}`,
        );
        return;
      }
      await notifyUsers(userIds, input);
      return;
    }

    // Per-recipient link → one row per (parent, student) pair. Dedup at the
    // pair level so a parent linked to a student twice doesn't get duplicates.
    const seen = new Set<string>();
    const rows: Array<{ userId: string; link: string }> = [];
    for (const e of enrollments) {
      const studentLink = opts.linkFor(e.studentId);
      for (const sg of e.student.guardians) {
        const uid = sg.guardian.userId;
        if (!uid) continue;
        const key = `${uid}|${e.studentId}`;
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push({ userId: uid, link: studentLink });
      }
    }
    if (rows.length === 0) {
      console.warn(
        `[notify] notifyClassroomParents: no linked parent users for classroom ${classroomId}`,
      );
      return;
    }
    try {
      await db.notification.createMany({
        data: rows.map((r) => ({
          userId: r.userId,
          kind: input.kind,
          title: input.title,
          body: input.body,
          link: r.link,
        })),
        skipDuplicates: true,
      });
    } catch (err) {
      console.warn('[notify] notifyClassroomParents per-recipient write failed', err);
    }
  } catch (err) {
    console.warn('[notify] notifyClassroomParents failed', err);
  }
}

/**
 * Find every active user matching one of the given roles and notify each.
 */
export async function notifyRoles(
  roles: Role[],
  input: Payload,
): Promise<void> {
  if (roles.length === 0) return;
  try {
    const users = await db.user.findMany({
      where: { role: { in: roles }, active: true, deletedAt: null },
      select: { id: true },
    });
    if (users.length === 0) {
      console.warn(
        `[notify] notifyRoles: no active users for roles ${roles.join(',')}`,
      );
      return;
    }
    await notifyUsers(
      users.map((u) => u.id),
      input,
    );
  } catch (err) {
    console.warn('[notify] notifyRoles failed', err);
  }
}

/**
 * Internal helper: resolve every user that is a guardian of `studentId`.
 * Exposed so action wiring can keep its lookups in one place.
 */
export async function getParentUserIdsForStudent(
  studentId: string,
): Promise<string[]> {
  try {
    const links = await db.studentGuardian.findMany({
      where: { studentId },
      select: { guardian: { select: { userId: true } } },
    });
    return links
      .map((l) => l.guardian.userId)
      .filter((id): id is string => Boolean(id));
  } catch (err) {
    console.warn('[notify] getParentUserIdsForStudent failed', err);
    return [];
  }
}
