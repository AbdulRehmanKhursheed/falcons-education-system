'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import {
  resetPasswordSchema,
  updateUserRoleSchema,
  type ResetPasswordInput,
  type UpdateUserRoleInput,
} from '@/lib/schemas/settings';
import type { ActionResult } from '@/app/(app)/settings/_actions';

async function loadUser(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, active: true, deletedAt: true },
  });
}

export async function updateUserRole(
  input: UpdateUserRoleInput,
): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN']);

  const parsed = updateUserRoleSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first.message };
  }
  const { userId, role } = parsed.data;

  if (userId === session.user.id) {
    return { ok: false, error: "You can't change your own role" };
  }

  const target = await loadUser(userId);
  if (!target || target.deletedAt) {
    return { ok: false, error: 'User not found' };
  }
  if (target.role === role) return { ok: true };

  const previousRole = target.role;
  await db.user.update({ where: { id: userId }, data: { role } });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'user.role_change',
      entityType: 'User',
      entityId: userId,
      diff: { from: previousRole, to: role },
    },
  });

  revalidatePath('/settings/users');
  return { ok: true };
}

export async function toggleUserActive(userId: string): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN']);

  if (userId === session.user.id) {
    return { ok: false, error: "You can't deactivate your own account" };
  }

  const target = await loadUser(userId);
  if (!target || target.deletedAt) {
    return { ok: false, error: 'User not found' };
  }

  const nextActive = !target.active;
  await db.user.update({
    where: { id: userId },
    data: { active: nextActive },
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: nextActive ? 'user.activate' : 'user.deactivate',
      entityType: 'User',
      entityId: userId,
      diff: { active: nextActive },
    },
  });

  revalidatePath('/settings/users');
  return { ok: true };
}

export async function resetUserPassword(
  input: ResetPasswordInput,
): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN']);

  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first.message, field: first.path.join('.') };
  }

  const target = await loadUser(parsed.data.userId);
  if (!target || target.deletedAt) {
    return { ok: false, error: 'User not found' };
  }

  const hash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db.user.update({
    where: { id: parsed.data.userId },
    data: { passwordHash: hash },
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'user.password_reset',
      entityType: 'User',
      entityId: parsed.data.userId,
      diff: { byActor: session.user.id },
    },
  });

  revalidatePath('/settings/users');
  return { ok: true };
}
