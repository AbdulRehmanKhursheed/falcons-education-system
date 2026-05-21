'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import {
  announcementSchema,
  type AnnouncementInput,
} from '@/lib/schemas/settings';
import type { ActionResult } from '@/app/(app)/settings/_actions';
import {
  notifyRoles,
  notifyClassroomParents,
  notifyUsers,
} from '@/lib/notify';

function normalize(input: AnnouncementInput) {
  return {
    title: input.title,
    body: input.body,
    audience: input.audience,
    classroomId: input.audience === 'CLASSROOM' ? input.classroomId ?? null : null,
    publishAt: input.publishAt ?? new Date(),
    expiresAt: input.expiresAt ?? null,
    pinned: Boolean(input.pinned),
  };
}

export async function createAnnouncement(
  input: AnnouncementInput,
): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const parsed = announcementSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first.message, field: first.path.join('.') };
  }

  const data = normalize(parsed.data);

  if (data.classroomId) {
    const classroom = await db.classroom.findUnique({
      where: { id: data.classroomId },
      select: { id: true },
    });
    if (!classroom) return { ok: false, error: 'Classroom not found', field: 'classroomId' };
  }

  const created = await db.announcement.create({
    data: {
      ...data,
      postedById: session.user.id,
    },
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'announcement.create',
      entityType: 'Announcement',
      entityId: created.id,
      diff: { title: created.title, audience: created.audience, pinned: created.pinned },
    },
  });

  // Fan-out notifications by audience — best effort, never blocks the
  // announcement create itself. Links are role-aware: parents land on
  // `/parent/announcements`, staff on `/notifications` (middleware blocks
  // parents from `/notifications` and would redirect them away).
  try {
    const basePayload = {
      kind: 'ANNOUNCEMENT' as const,
      title: created.title,
      body: created.body.length > 180 ? `${created.body.slice(0, 177)}…` : created.body,
    };
    const parentPayload = { ...basePayload, link: '/parent/announcements' };
    const staffPayload = { ...basePayload, link: '/notifications' };
    // Skip the author on staff broadcasts so they don't receive both the
    // role fan-out AND the explicit self-poke confirmation below.
    const excludeAuthor = session.user.id
      ? { excludeUserIds: [session.user.id] }
      : undefined;

    switch (created.audience) {
      case 'ALL':
        // Split so each role gets the link it can actually open.
        await Promise.all([
          notifyRoles(['PARENT'], parentPayload),
          notifyRoles(
            ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'ACCOUNTANT'],
            staffPayload,
            excludeAuthor,
          ),
        ]);
        break;
      case 'PARENTS_ONLY':
        await notifyRoles(['PARENT'], parentPayload);
        break;
      case 'STAFF_ONLY':
        await notifyRoles(
          ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'ACCOUNTANT'],
          staffPayload,
          excludeAuthor,
        );
        break;
      case 'CLASSROOM':
        if (created.classroomId) {
          await notifyClassroomParents(created.classroomId, parentPayload);
        }
        break;
      case 'CUSTOM':
        // Custom audience selection is not modelled yet — no fan-out.
        break;
    }

    // Always poke the author so they get a confirmation in their own inbox.
    // Author is staff (SUPER_ADMIN/SCHOOL_ADMIN), so the staff link applies.
    if (session.user.id) {
      await notifyUsers([session.user.id], {
        ...staffPayload,
        title: `Announcement posted · ${created.title}`,
        body: `Audience: ${created.audience.replace(/_/g, ' ').toLowerCase()}`,
      });
    }
  } catch (err) {
    console.warn('[announcements] fan-out failed', err);
  }

  revalidatePath('/settings/announcements');
  revalidatePath('/settings');
  revalidatePath('/dashboard');
  return { ok: true };
}

export async function updateAnnouncement(
  id: string,
  input: AnnouncementInput,
): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const existing = await db.announcement.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: 'Announcement not found' };

  const parsed = announcementSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first.message, field: first.path.join('.') };
  }

  const data = normalize(parsed.data);

  await db.announcement.update({ where: { id }, data });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'announcement.update',
      entityType: 'Announcement',
      entityId: id,
      diff: { title: data.title, audience: data.audience, pinned: data.pinned },
    },
  });

  revalidatePath('/settings/announcements');
  revalidatePath('/settings');
  revalidatePath('/dashboard');
  return { ok: true };
}

export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const existing = await db.announcement.findUnique({
    where: { id },
    select: { id: true, title: true },
  });
  if (!existing) return { ok: false, error: 'Announcement not found' };

  await db.announcement.delete({ where: { id } });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'announcement.delete',
      entityType: 'Announcement',
      entityId: id,
      diff: { title: existing.title },
    },
  });

  revalidatePath('/settings/announcements');
  revalidatePath('/settings');
  revalidatePath('/dashboard');
  return { ok: true };
}
