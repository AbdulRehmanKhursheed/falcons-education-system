'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight, Plus, Search } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import {
  enrollStudent,
  updateEnrollmentStatus,
} from '@/app/(app)/coaching/actions';
import type {
  CoachingBatchDetail,
  AvailableStudent,
} from '@/lib/queries/coaching';
import type { CoachingEnrollmentStatusInput } from '@/lib/schemas/coaching';

const statusOrder: CoachingEnrollmentStatusInput[] = [
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'DROPPED',
];

const statusLabel: Record<CoachingEnrollmentStatusInput, string> = {
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  COMPLETED: 'Completed',
  DROPPED: 'Dropped',
};

const statusTone: Record<
  CoachingEnrollmentStatusInput,
  Parameters<typeof Chip>[0]['tone']
> = {
  ACTIVE: 'success',
  PAUSED: 'warn',
  COMPLETED: 'brand',
  DROPPED: 'danger',
};

type Props = {
  batchId: string;
  isActive: boolean;
  capacity: number;
  enrollments: CoachingBatchDetail['enrollments'];
  availableStudents: AvailableStudent[];
  canEdit: boolean;
};

export function CoachingEnrollmentManager({
  batchId,
  isActive,
  capacity,
  enrollments,
  availableStudents,
  canEdit,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const activeCount = enrollments.filter((e) => e.status === 'ACTIVE').length;
  const atCapacity = activeCount >= capacity;

  const filteredAvailable = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return availableStudents.slice(0, 30);
    return availableStudents
      .filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q),
      )
      .slice(0, 30);
  }, [availableStudents, search]);

  function handleEnroll(studentId: string) {
    setErr(null);
    startTransition(async () => {
      const res = await enrollStudent(batchId, { studentId });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setSearch('');
      setShowPicker(false);
      router.refresh();
    });
  }

  function handleStatusChange(
    enrollmentId: string,
    next: CoachingEnrollmentStatusInput,
  ) {
    setErr(null);
    startTransition(async () => {
      const res = await updateEnrollmentStatus(enrollmentId, { status: next });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="px-5 py-5 space-y-4">
      {/* Enrolled list */}
      {enrollments.length === 0 ? (
        <p className="text-[13px] text-ink-muted italic">
          No students enrolled yet.
        </p>
      ) : (
        <ul className="divide-y divide-line-soft">
          {enrollments.map((e) => (
            <li
              key={e.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <Avatar name={e.studentName} size="sm" />
              <div className="flex-1 min-w-0">
                <Link
                  href={`/students/${e.studentId}`}
                  className="font-semibold text-ink text-[13.5px] truncate hover:text-brand-dark inline-flex items-center gap-1"
                >
                  {e.studentName}
                  <ArrowUpRight
                    className="w-3 h-3 text-ink-faint"
                    strokeWidth={2}
                  />
                </Link>
                <p className="text-[11.5px] text-ink-faint mt-0.5 truncate">
                  <span className="font-mono tabular">{e.studentRollNo}</span>
                  <span className="mx-1.5">·</span>
                  Joined {formatDate(e.joinedOnIso)}
                  {e.leftOnIso && (
                    <>
                      <span className="mx-1.5">·</span>
                      Left {formatDate(e.leftOnIso)}
                    </>
                  )}
                </p>
              </div>
              <Chip tone={statusTone[e.status]}>{statusLabel[e.status]}</Chip>
              {canEdit && (
                <select
                  aria-label={`Change status for ${e.studentName}`}
                  value={e.status}
                  onChange={(ev) =>
                    handleStatusChange(
                      e.id,
                      ev.target.value as CoachingEnrollmentStatusInput,
                    )
                  }
                  disabled={isPending}
                  className="rounded-md border border-line bg-surface-2 px-2 py-1 text-[12px] text-ink-soft hover:border-ink-faint focus:outline-none focus:border-ink disabled:opacity-50"
                >
                  {statusOrder.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel[s]}
                    </option>
                  ))}
                </select>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Add student */}
      {canEdit && isActive && (
        <div className="pt-3 border-t border-line-soft">
          {!showPicker ? (
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              disabled={atCapacity}
              title={atCapacity ? 'Batch is at capacity' : undefined}
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-2 px-3 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-ink hover:text-paper hover:border-ink transition-colors disabled:opacity-50 disabled:hover:bg-surface-2 disabled:hover:text-ink-soft disabled:hover:border-line"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              Add student
            </button>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint"
                  strokeWidth={1.75}
                />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or roll no…"
                  className="w-full pl-9 pr-4 py-2 rounded-md border border-line bg-surface-2 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink focus:bg-surface transition-colors"
                />
              </div>
              <div className="max-h-72 overflow-y-auto border border-line-soft rounded-md bg-surface-2">
                {filteredAvailable.length === 0 ? (
                  <p className="px-3 py-4 text-[12.5px] text-ink-faint italic">
                    No matching active students.
                  </p>
                ) : (
                  <ul className="divide-y divide-line-soft">
                    {filteredAvailable.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => handleEnroll(s.id)}
                          disabled={isPending}
                          className={cn(
                            'w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-surface transition-colors disabled:opacity-50',
                          )}
                        >
                          <Avatar name={s.fullName} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-ink text-[13px] truncate">
                              {s.fullName}
                            </p>
                            <p className="text-[11.5px] text-ink-faint truncate">
                              <span className="font-mono tabular">
                                {s.rollNo}
                              </span>
                              {s.classroomName && (
                                <>
                                  <span className="mx-1.5">·</span>
                                  {s.classroomName}
                                </>
                              )}
                            </p>
                          </div>
                          <Plus
                            className="w-3.5 h-3.5 text-ink-faint"
                            strokeWidth={2}
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPicker(false);
                  setSearch('');
                }}
                className="text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint hover:text-ink"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {err && (
        <p className="text-[12px] text-danger bg-danger-soft px-3 py-2 rounded-md border border-danger/20">
          {err}
        </p>
      )}
    </div>
  );
}
