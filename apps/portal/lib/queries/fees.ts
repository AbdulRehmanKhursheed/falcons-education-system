/**
 * Fees / invoices queries.
 *
 * All Decimal types are converted to `Number()` before returning so values
 * are safely serializable from server to client components.
 */

import { db } from '@/lib/db';
import type {
  InvoiceStatus,
  PaymentMethod,
  Prisma,
} from '@prisma/client';

// ── Helpers ────────────────────────────────────────────────────────────

export function currentMonthKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthRange(monthKey: string): { start: Date; end: Date } {
  const [y, m] = monthKey.split('-').map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);
  return { start, end };
}

// ── KPIs ───────────────────────────────────────────────────────────────

export type FeesKpis = {
  collectedThisMonth: number;
  outstandingTotal: number;
  overdueCount: number;
  issuedThisMonth: number;
};

export async function getFeesKpis(): Promise<FeesKpis> {
  const now = new Date();
  const { start: monthStart, end: monthEnd } = monthRange(currentMonthKey(now));
  const monthKey = currentMonthKey(now);

  const [paymentsAgg, openInvoices, overdueCount, issuedThisMonth] =
    await Promise.all([
      db.payment.aggregate({
        where: { paidAt: { gte: monthStart, lt: monthEnd } },
        _sum: { amount: true },
      }),
      db.invoice.findMany({
        where: { status: { in: ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'] } },
        select: { total: true, amountPaid: true },
      }),
      db.invoice.count({
        where: {
          OR: [
            { status: 'OVERDUE' },
            {
              status: { in: ['ISSUED', 'PARTIALLY_PAID'] },
              dueDate: { lt: now },
            },
          ],
        },
      }),
      db.invoice.count({ where: { monthYear: monthKey } }),
    ]);

  const outstandingTotal = openInvoices.reduce(
    (sum, inv) => sum + (Number(inv.total) - Number(inv.amountPaid)),
    0,
  );

  return {
    collectedThisMonth: Number(paymentsAgg._sum.amount ?? 0),
    outstandingTotal,
    overdueCount,
    issuedThisMonth,
  };
}

// ── Invoice list ───────────────────────────────────────────────────────

export type InvoiceListStatus =
  | 'all'
  | 'issued'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'cancelled';

export const invoiceListStatuses: Array<{
  id: InvoiceListStatus;
  label: string;
}> = [
  { id: 'all', label: 'All' },
  { id: 'issued', label: 'Issued' },
  { id: 'partially_paid', label: 'Partially paid' },
  { id: 'paid', label: 'Paid' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'cancelled', label: 'Cancelled' },
];

const statusFilterMap: Record<InvoiceListStatus, InvoiceStatus[] | null> = {
  all: null,
  issued: ['ISSUED'],
  partially_paid: ['PARTIALLY_PAID'],
  paid: ['PAID'],
  overdue: ['OVERDUE'],
  cancelled: ['CANCELLED'],
};

export type InvoiceRow = {
  id: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  classroom: string;
  monthYear: string;
  amount: number;
  discount: number;
  total: number;
  amountPaid: number;
  outstanding: number;
  status: InvoiceStatus;
  dueDate: string; // ISO
  issuedAt: string; // ISO
};

type GetInvoicesOpts = {
  status?: InvoiceListStatus;
  classroom?: string; // classroom name, or 'All'
  monthYear?: string; // 'YYYY-MM' or 'All'
  query?: string;
  take?: number;
  skip?: number;
};

export async function getInvoices(opts: GetInvoicesOpts = {}): Promise<{
  rows: InvoiceRow[];
  total: number;
}> {
  const {
    status = 'all',
    classroom = 'All',
    monthYear = 'All',
    query = '',
    take = 50,
    skip = 0,
  } = opts;

  const statusFilter = statusFilterMap[status];
  const q = query.trim();

  const where: Prisma.InvoiceWhereInput = {
    ...(statusFilter ? { status: { in: statusFilter } } : {}),
    ...(monthYear && monthYear !== 'All' ? { monthYear } : {}),
    ...(classroom && classroom !== 'All'
      ? {
          student: {
            enrollments: {
              some: { classroom: { name: classroom }, withdrawnAt: null },
            },
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { invoiceNo: { contains: q, mode: 'insensitive' } },
            { student: { fullName: { contains: q, mode: 'insensitive' } } },
            { student: { rollNo: { contains: q, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const [invoices, total] = await Promise.all([
    db.invoice.findMany({
      where,
      take,
      skip,
      orderBy: [{ issuedAt: 'desc' }, { invoiceNo: 'desc' }],
      select: {
        id: true,
        invoiceNo: true,
        monthYear: true,
        amount: true,
        discount: true,
        total: true,
        amountPaid: true,
        status: true,
        dueDate: true,
        issuedAt: true,
        student: {
          select: {
            id: true,
            fullName: true,
            rollNo: true,
            enrollments: {
              where: { withdrawnAt: null },
              take: 1,
              select: { classroom: { select: { name: true } } },
            },
          },
        },
      },
    }),
    db.invoice.count({ where }),
  ]);

  const rows: InvoiceRow[] = invoices.map((inv) => {
    const total = Number(inv.total);
    const amountPaid = Number(inv.amountPaid);
    return {
      id: inv.id,
      invoiceNo: inv.invoiceNo,
      studentId: inv.student.id,
      studentName: inv.student.fullName,
      rollNo: inv.student.rollNo,
      classroom: inv.student.enrollments[0]?.classroom.name ?? '—',
      monthYear: inv.monthYear,
      amount: Number(inv.amount),
      discount: Number(inv.discount),
      total,
      amountPaid,
      outstanding: total - amountPaid,
      status: inv.status,
      dueDate: inv.dueDate.toISOString(),
      issuedAt: inv.issuedAt.toISOString(),
    };
  });

  return { rows, total };
}

// ── Invoice detail ────────────────────────────────────────────────────

export type PaymentRow = {
  id: string;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  paidAt: string;
  recordedBy: string;
  notes: string | null;
};

export type InvoiceDetail = {
  id: string;
  invoiceNo: string;
  monthYear: string;
  amount: number;
  discount: number;
  total: number;
  amountPaid: number;
  outstanding: number;
  status: InvoiceStatus;
  dueDate: string;
  issuedAt: string;
  notes: string | null;
  feeStructureName: string | null;
  feeStructureFrequency: string | null;
  student: {
    id: string;
    fullName: string;
    rollNo: string;
    classroom: string;
    photoUrl: string | null;
  };
  guardian: {
    fullName: string;
    relation: string;
    phone: string;
    whatsapp: string | null;
  } | null;
  payments: PaymentRow[];
};

export async function getInvoiceDetail(
  id: string,
): Promise<InvoiceDetail | null> {
  const inv = await db.invoice.findUnique({
    where: { id },
    select: {
      id: true,
      invoiceNo: true,
      monthYear: true,
      amount: true,
      discount: true,
      total: true,
      amountPaid: true,
      status: true,
      dueDate: true,
      issuedAt: true,
      notes: true,
      feeStructure: { select: { name: true, frequency: true } },
      student: {
        select: {
          id: true,
          fullName: true,
          rollNo: true,
          photoUrl: true,
          enrollments: {
            where: { withdrawnAt: null },
            take: 1,
            select: { classroom: { select: { name: true } } },
          },
          guardians: {
            orderBy: { isPrimary: 'desc' },
            take: 1,
            select: {
              guardian: {
                select: {
                  fullName: true,
                  relation: true,
                  phone: true,
                  whatsapp: true,
                },
              },
            },
          },
        },
      },
      payments: {
        orderBy: { paidAt: 'desc' },
        select: {
          id: true,
          amount: true,
          method: true,
          reference: true,
          paidAt: true,
          notes: true,
          recordedBy: { select: { name: true } },
        },
      },
    },
  });

  if (!inv) return null;

  const total = Number(inv.total);
  const amountPaid = Number(inv.amountPaid);
  const primaryGuardian = inv.student.guardians[0]?.guardian ?? null;

  return {
    id: inv.id,
    invoiceNo: inv.invoiceNo,
    monthYear: inv.monthYear,
    amount: Number(inv.amount),
    discount: Number(inv.discount),
    total,
    amountPaid,
    outstanding: total - amountPaid,
    status: inv.status,
    dueDate: inv.dueDate.toISOString(),
    issuedAt: inv.issuedAt.toISOString(),
    notes: inv.notes,
    feeStructureName: inv.feeStructure?.name ?? null,
    feeStructureFrequency: inv.feeStructure?.frequency ?? null,
    student: {
      id: inv.student.id,
      fullName: inv.student.fullName,
      rollNo: inv.student.rollNo,
      classroom: inv.student.enrollments[0]?.classroom.name ?? '—',
      photoUrl: inv.student.photoUrl,
    },
    guardian: primaryGuardian
      ? {
          fullName: primaryGuardian.fullName,
          relation: primaryGuardian.relation,
          phone: primaryGuardian.phone,
          whatsapp: primaryGuardian.whatsapp,
        }
      : null,
    payments: inv.payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      method: p.method,
      reference: p.reference,
      paidAt: p.paidAt.toISOString(),
      notes: p.notes,
      recordedBy: p.recordedBy.name,
    })),
  };
}

// ── Fee structures ────────────────────────────────────────────────────

export type FeeStructureRow = {
  id: string;
  classroomId: string;
  classroomName: string;
  name: string;
  amount: number;
  frequency: string;
  active: boolean;
  invoiceCount: number;
  createdAt: string;
};

export async function getFeeStructures(): Promise<FeeStructureRow[]> {
  const rows = await db.feeStructure.findMany({
    orderBy: [
      { active: 'desc' },
      { classroom: { name: 'asc' } },
      { createdAt: 'desc' },
    ],
    select: {
      id: true,
      name: true,
      amount: true,
      frequency: true,
      active: true,
      createdAt: true,
      classroomId: true,
      classroom: { select: { name: true } },
      _count: { select: { invoices: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    classroomId: r.classroomId,
    classroomName: r.classroom.name,
    name: r.name,
    amount: Number(r.amount),
    frequency: r.frequency,
    active: r.active,
    invoiceCount: r._count.invoices,
    createdAt: r.createdAt.toISOString(),
  }));
}

// ── Filter options ────────────────────────────────────────────────────

export async function getClassroomsForFilter(): Promise<
  Array<{ id: string; name: string }>
> {
  const rows = await db.classroom.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
  return rows;
}

export async function getMonthsForFilter(): Promise<string[]> {
  const rows = await db.invoice.findMany({
    distinct: ['monthYear'],
    orderBy: { monthYear: 'desc' },
    select: { monthYear: true },
  });
  return rows.map((r) => r.monthYear);
}

// ── Generation helpers used by server actions ─────────────────────────

/**
 * Returns the next invoice sequence number for a given monthKey, based on
 * the highest existing `invoiceNo` like `INV-YYYY-MM-XXXX`. Falls back to
 * counting all invoices for the month + 1 if no numeric suffixes parse.
 */
export async function nextInvoiceSeqForMonth(
  monthKey: string,
): Promise<number> {
  const prefix = `INV-${monthKey}-`;
  const existing = await db.invoice.findMany({
    where: { invoiceNo: { startsWith: prefix } },
    select: { invoiceNo: true },
  });
  let max = 0;
  for (const { invoiceNo } of existing) {
    const tail = invoiceNo.slice(prefix.length);
    const n = parseInt(tail, 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  return max + 1;
}
