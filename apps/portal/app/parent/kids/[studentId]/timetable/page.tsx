import { notFound } from 'next/navigation';
import { CalendarRange } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/cn';
import { requireRole } from '@/lib/auth-helpers';
import {
  assertOwnsStudent,
  getChildHeader,
  getChildTimetable,
  type ChildTimetableRow,
} from '@/lib/queries/parent';
import { ChildHeader } from '../_components/ChildHeader';

export const metadata = { title: 'Timetable' };

const dayLabels = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayShort = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)}–${formatTime(end)}`;
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return t;
  const hour12 = ((h + 11) % 12) + 1;
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export default async function ChildTimetablePage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const session = await requireRole(['PARENT']);
  const { studentId } = await params;
  await assertOwnsStudent(session.user.id, studentId);

  const [child, entries] = await Promise.all([
    getChildHeader(studentId),
    getChildTimetable(studentId),
  ]);
  if (!child) notFound();

  return (
    <>
      <ChildHeader child={child} activeTab="timetable" />

      {entries.length === 0 ? (
        <Card>
          <div className="px-5 py-16 text-center">
            <CalendarRange className="w-5 h-5 text-accent mx-auto mb-2" strokeWidth={1.5} />
            <p
              className="font-display text-xl text-ink"
              style={{ fontVariationSettings: '"opsz" 24' }}
            >
              No timetable yet.
            </p>
            <p className="mt-1 text-[13px] text-ink-muted">
              The school will publish the weekly schedule shortly.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <DesktopGrid entries={entries} />
          <MobileList entries={entries} />
        </>
      )}
    </>
  );
}

function DesktopGrid({ entries }: { entries: ChildTimetableRow[] }) {
  // Group by day, sorted by period number.
  const byDay = new Map<number, ChildTimetableRow[]>();
  for (const e of entries) {
    if (!byDay.has(e.dayOfWeek)) byDay.set(e.dayOfWeek, []);
    byDay.get(e.dayOfWeek)!.push(e);
  }
  const days = Array.from(byDay.keys()).sort((a, b) => a - b);

  return (
    <div className="hidden md:block">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
        {days.map((d) => {
          const dayEntries = (byDay.get(d) ?? []).sort(
            (a, b) => a.periodNumber - b.periodNumber,
          );
          return (
            <Card key={d}>
              <div className="px-4 py-3 border-b border-line-soft">
                <p className="eyebrow text-ink-faint">
                  {dayShort[d] ?? `Day ${d}`}
                </p>
                <p
                  className="font-display text-lg text-ink leading-tight mt-0.5"
                  style={{ fontVariationSettings: '"opsz" 24' }}
                >
                  {dayLabels[d] ?? `Day ${d}`}
                </p>
              </div>
              <ul className="divide-y divide-line-soft">
                {dayEntries.map((e) => (
                  <li
                    key={e.id}
                    className={cn(
                      'px-4 py-3',
                      e.isBreak && 'bg-surface-2/60',
                    )}
                  >
                    <p className="text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint tabular">
                      {formatTimeRange(e.startTime, e.endTime)}
                    </p>
                    {e.isBreak ? (
                      <p className="text-[13px] text-ink-muted italic mt-1">
                        {e.label ?? 'Break'}
                      </p>
                    ) : (
                      <>
                        <p className="text-[13.5px] text-ink font-semibold leading-snug mt-1">
                          {e.subjectName ?? e.label ?? 'Class'}
                        </p>
                        {e.teacherName && (
                          <p className="text-[11.5px] text-ink-faint mt-0.5">
                            {e.teacherName}
                          </p>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function MobileList({ entries }: { entries: ChildTimetableRow[] }) {
  const byDay = new Map<number, ChildTimetableRow[]>();
  for (const e of entries) {
    if (!byDay.has(e.dayOfWeek)) byDay.set(e.dayOfWeek, []);
    byDay.get(e.dayOfWeek)!.push(e);
  }
  const days = Array.from(byDay.keys()).sort((a, b) => a - b);

  return (
    <div className="md:hidden space-y-4">
      {days.map((d) => {
        const dayEntries = (byDay.get(d) ?? []).sort(
          (a, b) => a.periodNumber - b.periodNumber,
        );
        return (
          <Card key={d}>
            <div className="px-4 py-3 border-b border-line-soft flex items-center justify-between">
              <p
                className="font-display text-lg text-ink leading-tight"
                style={{ fontVariationSettings: '"opsz" 24' }}
              >
                {dayLabels[d] ?? `Day ${d}`}
              </p>
              <Chip tone="neutral">{dayEntries.length} periods</Chip>
            </div>
            <ul className="divide-y divide-line-soft">
              {dayEntries.map((e) => (
                <li
                  key={e.id}
                  className={cn('px-4 py-3 flex items-baseline gap-3', e.isBreak && 'bg-surface-2/60')}
                >
                  <p className="w-24 shrink-0 text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-faint tabular">
                    {formatTimeRange(e.startTime, e.endTime)}
                  </p>
                  <div className="min-w-0">
                    {e.isBreak ? (
                      <p className="text-[13px] text-ink-muted italic">
                        {e.label ?? 'Break'}
                      </p>
                    ) : (
                      <>
                        <p className="text-[13.5px] text-ink font-semibold">
                          {e.subjectName ?? e.label ?? 'Class'}
                        </p>
                        {e.teacherName && (
                          <p className="text-[11.5px] text-ink-faint">{e.teacherName}</p>
                        )}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}
