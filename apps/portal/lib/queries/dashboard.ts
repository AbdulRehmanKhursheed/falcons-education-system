/**
 * Dashboard queries — return the same shapes as the previous mock-data so
 * components can swap cleanly. All return values are plain serializable
 * objects (no Prisma Decimal types) so they can be passed from server to
 * client components.
 */

import { db } from '@/lib/db';

export type Kpis = {
  totalStudents: number;
  attendanceToday: number;
  outstandingDues: number;
  openApplications: number;
  studentsTrend: number;
  attendanceTrend: number;
  recentCollections: number;
  applicationsTrend: number;
};

export async function getKpis(): Promise<Kpis> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thirtyDaysAgo = new Date(todayStart);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalStudents,
    studentsAddedLast30,
    todaysAttendance,
    todaysPresent,
    openApplications,
    applicationsLast7,
    trailingTotal,
    trailingPresent,
  ] = await Promise.all([
    db.student.count({ where: { deletedAt: null, status: { not: 'INACTIVE' } } }),
    db.student.count({
      where: { deletedAt: null, createdAt: { gte: thirtyDaysAgo } },
    }),
    db.attendance.count({ where: { date: todayStart } }),
    db.attendance.count({ where: { date: todayStart, status: 'PRESENT' } }),
    db.application.count({
      where: { stage: { in: ['RECEIVED', 'INTERVIEW', 'APPROVED'] } },
    }),
    db.application.count({ where: { submittedAt: { gte: sevenDaysAgo } } }),
    db.attendance.count({
      where: { date: { gte: thirtyDaysAgo, lt: todayStart } },
    }),
    db.attendance.count({
      where: { date: { gte: thirtyDaysAgo, lt: todayStart }, status: 'PRESENT' },
    }),
  ]);

  const attendanceToday =
    todaysAttendance > 0 ? (todaysPresent / todaysAttendance) * 100 : 0;

  // Trailing 30-day attendance % (excluding today). 0 if no rows.
  const trailingAttendance =
    trailingTotal > 0 ? (trailingPresent / trailingTotal) * 100 : 0;
  const attendanceTrend =
    trailingTotal > 0
      ? Math.round((attendanceToday - trailingAttendance) * 10) / 10
      : 0;

  // Outstanding dues: sum (total - amountPaid) for non-paid/non-cancelled invoices.
  const duesAgg = await db.invoice.findMany({
    where: { status: { in: ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'] } },
    select: { total: true, amountPaid: true },
  });
  const outstandingDues = duesAgg.reduce(
    (sum, inv) => sum + (Number(inv.total) - Number(inv.amountPaid)),
    0,
  );

  // Total collected in the last 30 days (positive value for "money in").
  const recentPayments = await db.payment.aggregate({
    where: { paidAt: { gte: thirtyDaysAgo } },
    _sum: { amount: true },
  });
  const recentCollections = Math.abs(Number(recentPayments._sum.amount ?? 0));

  return {
    totalStudents,
    attendanceToday: Math.round(attendanceToday * 10) / 10,
    outstandingDues,
    openApplications,
    studentsTrend: studentsAddedLast30,
    attendanceTrend,
    recentCollections,
    applicationsTrend: applicationsLast7,
  };
}

export type AttendanceSeriesPoint = {
  day: string;
  present: number;
  absent: number;
  late: number;
};

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export async function getAttendanceSeries(): Promise<AttendanceSeriesPoint[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Last 6 days, ending today.
  const days: Date[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  const start = days[0];
  const end = new Date(days[days.length - 1]);
  end.setDate(end.getDate() + 1);

  const rows = await db.attendance.findMany({
    where: { date: { gte: start, lt: end } },
    select: { date: true, status: true },
  });

  return days.map((d) => {
    const key = d.getTime();
    const dayRows = rows.filter((r) => new Date(r.date).getTime() === key);
    const present = dayRows.filter((r) => r.status === 'PRESENT').length;
    const absent = dayRows.filter((r) => r.status === 'ABSENT').length;
    const late = dayRows.filter((r) => r.status === 'LATE').length;
    return {
      day: dayLabels[d.getDay()],
      present,
      absent,
      late,
    };
  });
}

export type FeesSeriesPoint = {
  month: string;
  collected: number;
  expected: number;
};

const monthLabels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export async function getFeesSeries(): Promise<FeesSeriesPoint[]> {
  const now = new Date();
  // Last 6 months ending current month
  const buckets: Array<{ year: number; month: number; key: string; label: string }> = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth();
    const year = d.getFullYear();
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;
    buckets.push({ year, month, key, label: monthLabels[month] });
  }

  const start = new Date(buckets[0].year, buckets[0].month, 1);

  const [invoices, payments] = await Promise.all([
    db.invoice.findMany({
      where: { issuedAt: { gte: start } },
      select: { monthYear: true, total: true },
    }),
    db.payment.findMany({
      where: { paidAt: { gte: start } },
      select: { paidAt: true, amount: true },
    }),
  ]);

  return buckets.map((b) => {
    const expected = invoices
      .filter((i) => i.monthYear === b.key)
      .reduce((sum, i) => sum + Number(i.total), 0);

    const collected = payments
      .filter((p) => {
        const d = new Date(p.paidAt);
        return d.getFullYear() === b.year && d.getMonth() === b.month;
      })
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return { month: b.label, collected, expected };
  });
}

// ── Active announcements (dashboard panel) ───────────────────────────

export type DashboardAnnouncement = {
  id: string;
  title: string;
  body: string;
  audience: 'ALL' | 'STAFF_ONLY' | 'PARENTS_ONLY' | 'CLASSROOM' | 'CUSTOM';
  publishAt: string; // ISO string
  pinned: boolean;
  kind: 'pinned' | 'reminder' | 'event' | 'announcement';
};

export async function getActiveAnnouncements(): Promise<DashboardAnnouncement[]> {
  const now = new Date();
  const rows = await db.announcement.findMany({
    where: {
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: [{ pinned: 'desc' }, { publishAt: 'desc' }],
    take: 5,
    select: {
      id: true,
      title: true,
      body: true,
      audience: true,
      publishAt: true,
      pinned: true,
    },
  });

  return rows.map((a) => {
    let kind: DashboardAnnouncement['kind'];
    if (a.pinned) kind = 'pinned';
    else if (a.audience === 'CLASSROOM') kind = 'event';
    else if (a.audience === 'PARENTS_ONLY') kind = 'reminder';
    else kind = 'announcement';
    return {
      id: a.id,
      title: a.title,
      body: a.body,
      audience: a.audience,
      publishAt: a.publishAt.toISOString(),
      pinned: a.pinned,
      kind,
    };
  });
}

export type ActivityEvent = {
  id: string;
  kind: 'admission' | 'fee' | 'attendance' | 'assessment' | 'announcement';
  text: string;
  meta: string;
  time: string;
};

function timeAgo(date: Date): string {
  const ms = Date.now() - date.getTime();
  const mins = Math.round(ms / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });
}

type ActivityEventInternal = ActivityEvent & { sortKey: number };

export async function getRecentActivity(): Promise<ActivityEvent[]> {
  const [apps, payments, announcements] = await Promise.all([
    db.application.findMany({
      orderBy: { submittedAt: 'desc' },
      take: 3,
      select: {
        id: true,
        applicantName: true,
        programInterest: true,
        childAge: true,
        submittedAt: true,
      },
    }),
    db.payment.findMany({
      orderBy: { paidAt: 'desc' },
      take: 3,
      select: {
        id: true,
        amount: true,
        paidAt: true,
        invoice: {
          select: {
            invoiceNo: true,
            student: { select: { fullName: true } },
          },
        },
      },
    }),
    db.announcement.findMany({
      orderBy: { publishAt: 'desc' },
      take: 2,
      select: { id: true, title: true, publishAt: true },
    }),
  ]);

  const events: ActivityEventInternal[] = [
    ...apps.map((a) => ({
      id: `app-${a.id}`,
      kind: 'admission' as const,
      text: `New application from ${a.applicantName}`,
      meta: `${a.programInterest.replace(/_/g, ' ').toLowerCase()} · ${a.childAge}`,
      time: timeAgo(a.submittedAt),
      sortKey: a.submittedAt.getTime(),
    })),
    ...payments.map((p) => ({
      id: `pay-${p.id}`,
      kind: 'fee' as const,
      text: `Invoice paid · ${p.invoice.student.fullName}`,
      meta: `${p.invoice.invoiceNo} · ₨${Number(p.amount).toLocaleString('en-PK')}`,
      time: timeAgo(p.paidAt),
      sortKey: p.paidAt.getTime(),
    })),
    ...announcements.map((a) => ({
      id: `ann-${a.id}`,
      kind: 'announcement' as const,
      text: a.title,
      meta: 'Announcement',
      time: timeAgo(a.publishAt),
      sortKey: a.publishAt.getTime(),
    })),
  ];

  return events
    .sort((a, b) => b.sortKey - a.sortKey)
    .slice(0, 6)
    .map(({ sortKey: _sortKey, ...rest }) => rest);
}
