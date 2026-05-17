import {
  Users,
  CalendarCheck,
  Receipt,
  ClipboardList,
  ArrowUpRight,
  Plus,
  Megaphone,
  CalendarDays,
} from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { KPI } from '@/components/data/KPI';
import { AttendanceChart } from '@/components/data/AttendanceChart';
import { FeesChart } from '@/components/data/FeesChart';
import { ActivityFeed } from '@/components/data/ActivityFeed';
import { formatPKR, formatNumber, formatPercent } from '@/lib/format';
import {
  getKpis,
  getAttendanceSeries,
  getFeesSeries,
  getRecentActivity,
} from '@/lib/queries/dashboard';
import { requireRole } from '@/lib/auth-helpers';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const session = await requireRole([
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'TEACHER',
    'PARENT',
    'ACCOUNTANT',
  ]);

  const [kpis, attendanceSeries, feesSeries, recentActivity] = await Promise.all([
    getKpis(),
    getAttendanceSeries(),
    getFeesSeries(),
    getRecentActivity(),
  ]);

  const today = new Date().toLocaleDateString('en-PK', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const firstName = session.user.name?.split(' ')[0] ?? 'there';

  return (
    <>
      <PageHeader
        eyebrow={today}
        title={`Good morning, ${firstName}.`}
        description="A quick overview of the school today — attendance, applications, and fees collection."
        actions={
          <>
            <Link
              href="/students"
              className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
            >
              View all students
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
            <Link
              href="/admissions"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.25} />
              New admission
            </Link>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPI
          label="Total students"
          value={formatNumber(kpis.totalStudents)}
          delta={{ value: `+${kpis.studentsTrend}`, positive: kpis.studentsTrend >= 0, suffix: 'last 30d' }}
          Icon={Users}
        />
        <KPI
          label="Attendance today"
          value={formatPercent(kpis.attendanceToday)}
          delta={{ value: `${kpis.attendanceTrend}%`, positive: kpis.attendanceTrend >= 0, suffix: 'vs avg' }}
          Icon={CalendarCheck}
        />
        <KPI
          label="Outstanding dues"
          value={formatPKR(kpis.outstandingDues)}
          delta={{ value: formatPKR(Math.abs(kpis.duesTrend)), positive: kpis.duesTrend < 0, suffix: 'cleared' }}
          Icon={Receipt}
        />
        <KPI
          label="Open applications"
          value={formatNumber(kpis.openApplications)}
          delta={{ value: `+${kpis.applicationsTrend}`, positive: kpis.applicationsTrend >= 0, suffix: 'this week' }}
          Icon={ClipboardList}
        />
      </div>

      {/* Chart row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader
            eyebrow="Last 6 days"
            title="Attendance"
            meta="Present · late · absent across the school"
            action={
              <Link href="/attendance" className="text-[12px] text-ink-muted hover:text-ink underline decoration-line decoration-1 underline-offset-[5px]">
                See breakdown
              </Link>
            }
          />
          <div className="p-5">
            <AttendanceChart data={attendanceSeries} />
          </div>
        </Card>

        <Card>
          <CardHeader
            eyebrow="Last 6 months"
            title="Fees collection"
            meta="Collected vs expected"
            action={
              <Link href="/fees" className="text-[12px] text-ink-muted hover:text-ink underline decoration-line decoration-1 underline-offset-[5px]">
                Detail
              </Link>
            }
          />
          <div className="p-5">
            <FeesChart data={feesSeries} />
          </div>
        </Card>
      </div>

      {/* Activity + quick actions row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Activity feed */}
        <Card className="lg:col-span-2">
          <CardHeader
            eyebrow="Today"
            title="Activity"
            meta="Latest events across admissions, fees, attendance"
            action={<Chip tone="brand">Live</Chip>}
          />
          <ActivityFeed events={recentActivity} />
        </Card>

        {/* Quick actions + announcements */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader eyebrow="Shortcuts" title="Quick actions" />
            <div className="p-3 grid grid-cols-1 gap-1">
              {[
                { href: '/students',     label: 'Add new student',     Icon: Users },
                { href: '/admissions',   label: 'Review applications', Icon: ClipboardList },
                { href: '/attendance',   label: 'Mark today attendance', Icon: CalendarCheck },
                { href: '/fees',         label: 'Generate invoices',   Icon: Receipt },
              ].map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-md hover:bg-surface-3 transition-colors group"
                >
                  <span className="inline-flex items-center gap-2.5 text-[13px] text-ink-soft group-hover:text-ink">
                    <Icon className="w-4 h-4 text-ink-faint group-hover:text-accent transition-colors" strokeWidth={1.75} />
                    {label}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-ink-faint group-hover:text-ink group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" strokeWidth={2} />
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader
              eyebrow="Today"
              title="Announcements"
              meta="What's happening this week"
              action={<Megaphone className="w-4 h-4 text-accent" strokeWidth={1.5} />}
            />
            <ul className="divide-y divide-line-soft">
              <li className="px-5 py-3.5">
                <div className="flex items-baseline gap-2 mb-1">
                  <Chip tone="warn">Reminder</Chip>
                  <span className="text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">Fri · 16 May</span>
                </div>
                <p className="text-[13.5px] text-ink">Mid-term assessment week begins</p>
              </li>
              <li className="px-5 py-3.5">
                <div className="flex items-baseline gap-2 mb-1">
                  <Chip tone="info">Event</Chip>
                  <span className="text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">Sat · 17 May</span>
                </div>
                <p className="text-[13.5px] text-ink">Parent-teacher meeting · 10:00 – 12:00</p>
              </li>
              <li className="px-5 py-3.5">
                <div className="flex items-baseline gap-2 mb-1">
                  <Chip tone="brand">Admissions</Chip>
                  <span className="text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">Ongoing</span>
                </div>
                <p className="text-[13.5px] text-ink">2026 session admissions — {kpis.openApplications} open applications</p>
              </li>
            </ul>
            <div className="px-5 py-3 border-t border-line-soft">
              <button
                type="button"
                className="inline-flex items-center gap-2 text-[12px] font-semibold text-ink-soft hover:text-ink transition-colors"
              >
                <CalendarDays className="w-3.5 h-3.5" strokeWidth={1.75} />
                Open school calendar
              </button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
