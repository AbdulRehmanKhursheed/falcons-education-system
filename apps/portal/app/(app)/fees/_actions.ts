'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers';
import {
  recordPaymentSchema,
  applyDiscountSchema,
  type RecordPaymentInput,
  type ApplyDiscountInput,
} from '@/lib/schemas/fees';
import {
  currentMonthKey,
  getInvoices,
  type InvoiceListStatus,
  type InvoiceRow,
} from '@/lib/queries/fees';
import type { InvoiceStatus } from '@prisma/client';
import { notifyUsers, getParentUserIdsForStudent } from '@/lib/notify';

// ── Search / filter ──────────────────────────────────────────────────

export async function searchInvoices(opts: {
  status: InvoiceListStatus;
  classroom: string;
  monthYear: string;
  query: string;
}): Promise<{ rows: InvoiceRow[]; total: number }> {
  await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT']);
  return getInvoices({
    status: opts.status,
    classroom: opts.classroom,
    monthYear: opts.monthYear,
    query: opts.query,
    take: 100,
    skip: 0,
  });
}

export type ActionResult<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

/**
 * Compute the next invoice status based on the running totals. Cancelled
 * invoices are sticky — they never auto-transition.
 */
function deriveStatus(opts: {
  current: InvoiceStatus;
  total: number;
  amountPaid: number;
  dueDate: Date;
}): InvoiceStatus {
  if (opts.current === 'CANCELLED') return 'CANCELLED';
  if (opts.amountPaid <= 0) {
    if (opts.dueDate.getTime() < Date.now()) return 'OVERDUE';
    return 'ISSUED';
  }
  if (opts.amountPaid >= opts.total) return 'PAID';
  return 'PARTIALLY_PAID';
}

// ── Record payment ────────────────────────────────────────────────────

export async function recordPayment(
  input: RecordPaymentInput,
): Promise<ActionResult<{ paymentId: string }>> {
  const session = await requireRole([
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'ACCOUNTANT',
  ]);

  const parsed = recordPaymentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }
  const { invoiceId, amount, method, reference, paidAt, notes } = parsed.data;

  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    select: {
      id: true,
      invoiceNo: true,
      studentId: true,
      total: true,
      amountPaid: true,
      status: true,
      dueDate: true,
    },
  });
  if (!invoice) return { ok: false, error: 'Invoice not found' };
  if (invoice.status === 'CANCELLED') {
    return { ok: false, error: 'Cannot record payment on a cancelled invoice' };
  }

  const total = Number(invoice.total);
  const currentPaid = Number(invoice.amountPaid);
  const nextPaid = currentPaid + amount;

  // Allow small overpayment? Block it — accountant should adjust discount.
  if (nextPaid > total + 0.01) {
    return {
      ok: false,
      error: `Payment exceeds outstanding balance (₨${(total - currentPaid).toLocaleString(
        'en-PK',
      )} remaining).`,
    };
  }

  const nextStatus = deriveStatus({
    current: invoice.status,
    total,
    amountPaid: nextPaid,
    dueDate: invoice.dueDate,
  });

  const result = await db.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        invoiceId,
        amount,
        method,
        reference,
        paidAt: paidAt ? new Date(paidAt) : new Date(),
        notes,
        recordedById: session.user.id,
      },
    });

    await tx.invoice.update({
      where: { id: invoiceId },
      data: { amountPaid: nextPaid, status: nextStatus },
    });

    await tx.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'payment.record',
        entityType: 'Payment',
        entityId: payment.id,
        diff: { invoiceId, amount, method, status: nextStatus },
      },
    });

    return payment;
  });

  // Best-effort parent notification — never block the action on a failure.
  try {
    const parentUserIds = await getParentUserIdsForStudent(invoice.studentId);
    if (parentUserIds.length > 0) {
      const amountLabel = `₨${amount.toLocaleString('en-PK')}`;
      await notifyUsers(parentUserIds, {
        kind: 'FEE',
        title: `Payment received · ${amountLabel}`,
        body: `Invoice ${invoice.invoiceNo} · ${
          nextStatus === 'PAID' ? 'Paid in full' : 'Partial payment'
        }`,
        link: `/parent/kids/${invoice.studentId}/fees`,
      });
    }
  } catch (err) {
    console.warn('[fees] payment notification failed', err);
  }

  revalidatePath('/fees');
  revalidatePath(`/fees/${invoiceId}`);
  revalidatePath('/dashboard');
  return { ok: true, data: { paymentId: result.id } };
}

// ── Apply discount ───────────────────────────────────────────────────

export async function applyDiscount(
  input: ApplyDiscountInput,
): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const parsed = applyDiscountSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }
  const { invoiceId, discount } = parsed.data;

  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    select: { id: true, amount: true, amountPaid: true, status: true, dueDate: true },
  });
  if (!invoice) return { ok: false, error: 'Invoice not found' };
  if (invoice.status === 'CANCELLED') {
    return { ok: false, error: 'Cannot apply discount to a cancelled invoice' };
  }

  const amount = Number(invoice.amount);
  if (discount > amount) {
    return { ok: false, error: 'Discount cannot exceed the invoice amount' };
  }

  const newTotal = amount - discount;
  const amountPaid = Number(invoice.amountPaid);
  if (amountPaid > newTotal + 0.01) {
    return {
      ok: false,
      error: 'Discount would make total less than already-paid amount',
    };
  }
  const nextStatus = deriveStatus({
    current: invoice.status,
    total: newTotal,
    amountPaid,
    dueDate: invoice.dueDate,
  });

  await db.$transaction([
    db.invoice.update({
      where: { id: invoiceId },
      data: { discount, total: newTotal, status: nextStatus },
    }),
    db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'invoice.discount',
        entityType: 'Invoice',
        entityId: invoiceId,
        diff: { discount, newTotal, status: nextStatus },
      },
    }),
  ]);

  revalidatePath('/fees');
  revalidatePath(`/fees/${invoiceId}`);
  return { ok: true };
}

// ── Cancel invoice ───────────────────────────────────────────────────

export async function cancelInvoice(
  invoiceId: string,
): Promise<ActionResult> {
  const session = await requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']);

  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    select: { status: true, amountPaid: true },
  });
  if (!invoice) return { ok: false, error: 'Invoice not found' };
  if (invoice.status === 'CANCELLED') return { ok: true };
  if (Number(invoice.amountPaid) > 0) {
    return {
      ok: false,
      error: 'Refund recorded payments before cancelling this invoice',
    };
  }

  await db.$transaction([
    db.invoice.update({
      where: { id: invoiceId },
      data: { status: 'CANCELLED' },
    }),
    db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'invoice.cancel',
        entityType: 'Invoice',
        entityId: invoiceId,
      },
    }),
  ]);

  revalidatePath('/fees');
  revalidatePath(`/fees/${invoiceId}`);
  revalidatePath('/dashboard');
  return { ok: true };
}

// ── Generate monthly invoices ────────────────────────────────────────

/**
 * Idempotent — for the current calendar month, create one invoice per
 * active student × every active monthly FeeStructure for that student's
 * current classroom, skipping any (student, feeStructure, monthYear)
 * combinations that already exist.
 */
export async function generateMonthlyInvoices(): Promise<
  ActionResult<{ created: number; skipped: number; monthYear: string }>
> {
  const session = await requireRole([
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'ACCOUNTANT',
  ]);

  const now = new Date();
  const monthKey = currentMonthKey(now);
  // Due on the 10th of the current month by convention.
  const dueDate = new Date(now.getFullYear(), now.getMonth(), 10);

  // Fetch active students with their current (un-withdrawn) classroom and
  // the active monthly fee structures attached to that classroom.
  const students = await db.student.findMany({
    where: { deletedAt: null, status: { in: ['ACTIVE', 'ON_LEAVE'] } },
    select: {
      id: true,
      enrollments: {
        where: { withdrawnAt: null },
        take: 1,
        select: {
          classroom: {
            select: {
              id: true,
              feeStructures: {
                where: { active: true, frequency: 'monthly' },
                select: { id: true, amount: true },
              },
            },
          },
        },
      },
      invoices: {
        where: { monthYear: monthKey },
        select: { feeStructureId: true },
      },
    },
  });

  // Build (student, feeStructure) pairs outside the transaction. The actual
  // sequence computation, dedupe re-check, createMany, and audit log all run
  // inside a single transaction so two concurrent admin clicks serialize on
  // the same monthly read instead of racing for the same invoice numbers.
  let skipped = 0;
  type Pending = { studentId: string; feeStructureId: string; amount: number };
  const pending: Pending[] = [];

  for (const s of students) {
    const enrolment = s.enrollments[0];
    if (!enrolment) {
      skipped++;
      continue;
    }
    const existingFsIds = new Set(
      s.invoices.map((i) => i.feeStructureId).filter(Boolean) as string[],
    );
    for (const fs of enrolment.classroom.feeStructures) {
      if (existingFsIds.has(fs.id)) {
        skipped++;
        continue;
      }
      pending.push({
        studentId: s.id,
        feeStructureId: fs.id,
        amount: Number(fs.amount),
      });
    }
  }

  const created = await db.$transaction(async (tx) => {
    if (pending.length === 0) return 0;

    // Recompute sequence INSIDE the transaction — this is the only place a
    // collision on invoice numbers can occur, and reading inside the txn
    // serializes concurrent batch generations.
    const prefix = `INV-${monthKey}-`;
    const existing = await tx.invoice.findMany({
      where: { invoiceNo: { startsWith: prefix } },
      select: { invoiceNo: true },
    });
    let seq = 0;
    for (const { invoiceNo } of existing) {
      const tail = invoiceNo.slice(prefix.length);
      const n = parseInt(tail, 10);
      if (!Number.isNaN(n) && n > seq) seq = n;
    }
    seq += 1;

    const rows = pending.map((p, i) => ({
      invoiceNo: `INV-${monthKey}-${String(seq + i).padStart(4, '0')}`,
      studentId: p.studentId,
      feeStructureId: p.feeStructureId,
      monthYear: monthKey,
      amount: p.amount,
      discount: 0,
      total: p.amount,
      amountPaid: 0,
      status: 'ISSUED' as const,
      dueDate,
    }));

    const result = await tx.invoice.createMany({
      data: rows,
      skipDuplicates: true,
    });

    await tx.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'invoice.batch_generate',
        entityType: 'Invoice',
        entityId: monthKey,
        diff: { monthYear: monthKey, created: result.count, skipped },
      },
    });

    return result.count;
  });

  revalidatePath('/fees');
  revalidatePath('/dashboard');
  // P1-09: student detail pages show outstanding dues — invalidate them too.
  revalidatePath('/students', 'layout');
  return { ok: true, data: { created, skipped, monthYear: monthKey } };
}
