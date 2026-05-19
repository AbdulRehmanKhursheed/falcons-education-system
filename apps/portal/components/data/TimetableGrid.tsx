'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  Filter,
  Coffee,
  Plus,
  X,
  Pencil,
  Trash2,
  Check,
  Lock,
  Info,
} from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/cn';
import type {
  TimetableClassroomOption,
  TimetableGrid as TimetableGridData,
  TimetableEntryCell,
  PeriodRow,
  SubjectRow,
  TeacherOption,
} from '@/lib/queries/timetable';
import {
  deleteEntry,
  loadGrid,
  upsertEntry,
} from '@/app/(app)/timetable/_actions';

type Props = {
  classrooms: TimetableClassroomOption[];
  initialClassroomId: string;
  initialGrid: TimetableGridData;
  initialDay: number;
  todayDay: number;
  subjects: SubjectRow[];
  teachers: TeacherOption[];
  canEdit: boolean;
};

type ChipTone = Parameters<typeof Chip>[0]['tone'];

const SUBJECT_TONES: ChipTone[] = ['brand', 'accent', 'info', 'success', 'warn'];

/**
 * Stable subject → tone mapping derived from the subject `order` field so
 * Math is always brand, Urdu always accent, etc. New subjects fall back to
 * a name-hash, keeping the colour stable across renders.
 */
function subjectTone(subject: { order: number | null; name: string }): ChipTone {
  if (subject.order !== null && subject.order > 0) {
    return SUBJECT_TONES[(subject.order - 1) % SUBJECT_TONES.length];
  }
  // Hash by name as a fallback (deterministic).
  let h = 0;
  for (let i = 0; i < subject.name.length; i++) {
    h = (h * 31 + subject.name.charCodeAt(i)) >>> 0;
  }
  return SUBJECT_TONES[h % SUBJECT_TONES.length];
}

function teacherInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

const DAY_LABELS: Record<number, string> = {
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
};

const DAY_LONG: Record<number, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

export function TimetableGrid({
  classrooms,
  initialClassroomId,
  initialGrid,
  initialDay,
  todayDay,
  subjects,
  teachers,
  canEdit,
}: Props) {
  const [classroomId, setClassroomId] = useState(initialClassroomId);
  const [grid, setGrid] = useState<TimetableGridData>(initialGrid);
  const [selectedDay, setSelectedDay] = useState(initialDay);
  const [error, setError] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState<string | null>(null); // `${day}:${periodId}`
  const [isPending, startTransition] = useTransition();

  // Day list — show Mon-Sat when any Saturday entry exists, else Mon-Fri so
  // the grid stays tight for schools that don't operate on Saturday.
  const dayChips = useMemo(
    () => (grid.days.includes(6) ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5]),
    [grid.days],
  );

  function handleClassroomChange(id: string) {
    if (id === classroomId) return;
    setClassroomId(id);
    setError(null);
    setEditorKey(null);
    startTransition(async () => {
      try {
        const next = await loadGrid(id);
        if (next) setGrid(next);
      } catch (err) {
        setError(messageOf(err));
      }
    });
  }

  async function refreshGrid() {
    try {
      const next = await loadGrid(classroomId);
      if (next) setGrid(next);
    } catch (err) {
      setError(messageOf(err));
    }
  }

  function handleSave(
    periodId: string,
    payload: {
      subjectId: string | null;
      teacherId: string | null;
      notes: string;
    },
  ) {
    setError(null);
    startTransition(async () => {
      const result = await upsertEntry({
        classroomId,
        periodId,
        dayOfWeek: selectedDay,
        subjectId: payload.subjectId,
        teacherId: payload.teacherId,
        notes: payload.notes,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await refreshGrid();
      setEditorKey(null);
    });
  }

  function handleClear(entryId: string) {
    if (!confirm('Remove this timetable cell?')) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteEntry(entryId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await refreshGrid();
      setEditorKey(null);
    });
  }

  const activeClassroom = classrooms.find((c) => c.id === classroomId);

  return (
    <div className="bg-surface border border-line rounded-lg">
      {/* Toolbar: classroom pills */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-line-soft">
        <div className="flex items-center gap-1 text-[11.5px] font-semibold text-ink-faint">
          <Filter className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span className="uppercase tracking-[0.14em]">Classroom</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {classrooms.map((c) => {
            const active = c.id === classroomId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleClassroomChange(c.id)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition-colors inline-flex items-center gap-1.5',
                  active
                    ? 'bg-ink text-paper border-ink'
                    : 'bg-surface-2 text-ink-soft border-line hover:border-ink-faint hover:text-ink',
                )}
              >
                {c.name}
                {!c.hasTimetable && !active && (
                  <span
                    className="text-[9.5px] uppercase tracking-[0.12em] text-ink-faint"
                    title="No timetable yet"
                  >
                    new
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Header strip */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3.5 border-b border-line-soft bg-surface-2">
        <div className="min-w-0">
          <p className="eyebrow text-ink-faint">
            {activeClassroom?.programKind.replace(/_/g, ' ').toLowerCase()}
          </p>
          <h3
            className="font-display text-[1.05rem] text-ink leading-tight"
            style={{ fontVariationSettings: '"opsz" 24' }}
          >
            {grid.classroom.name}
          </h3>
        </div>
        {grid.classroom.homeroomTeacher && (
          <p className="text-[12px] text-ink-soft">
            Homeroom · <span className="text-ink font-semibold">{grid.classroom.homeroomTeacher.name}</span>
          </p>
        )}
        <div className="ml-auto">
          {!canEdit && (
            <span className="inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
              <Lock className="w-3 h-3" strokeWidth={1.75} />
              Read-only
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-5 py-3 border-b border-line-soft bg-danger-soft/40 text-danger text-[12.5px]">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      {/* Day selector (mobile-only view-switcher) */}
      <div className="md:hidden px-5 py-3 border-b border-line-soft flex flex-wrap gap-1">
        {dayChips.map((d) => {
          const active = d === selectedDay;
          const isToday = d === todayDay;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDay(d)}
              className={cn(
                'px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition-colors',
                active
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-surface-2 text-ink-soft border-line hover:border-ink-faint hover:text-ink',
              )}
            >
              {DAY_LABELS[d]}
              {isToday && !active && <span className="ml-1 text-accent">·</span>}
            </button>
          );
        })}
      </div>

      {/* Desktop: full weekly grid */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-[12.5px] table-fixed">
          <colgroup>
            <col className="w-[160px]" />
            {dayChips.map((d) => (
              <col key={d} />
            ))}
          </colgroup>
          <thead>
            <tr className="bg-surface-3/60">
              <th className="px-3 py-2.5 text-left text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
                Period
              </th>
              {dayChips.map((d) => (
                <th
                  key={d}
                  className={cn(
                    'px-3 py-2.5 text-left text-[10.5px] uppercase tracking-[0.14em] font-semibold',
                    d === todayDay ? 'text-accent' : 'text-ink-faint',
                  )}
                >
                  {DAY_LABELS[d]}
                  {d === todayDay && (
                    <span className="ml-1 text-[9px] normal-case tracking-wider">today</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {grid.periods.map((p) => (
              <tr key={p.id} className="align-top">
                <td
                  className={cn(
                    'px-3 py-2.5 border-r border-line-soft bg-surface-3/30',
                    p.isBreak && 'bg-warn-soft/30',
                  )}
                >
                  <PeriodHead period={p} />
                </td>
                {dayChips.map((d) => {
                  const key = `${d}:${p.id}`;
                  const cell = grid.entries[key];
                  const isEditing = editorKey === key && canEdit;
                  return (
                    <td
                      key={key}
                      className={cn(
                        'px-1.5 py-1.5 border-r last:border-r-0 border-line-soft align-top',
                        p.isBreak && 'bg-warn-soft/20',
                      )}
                    >
                      {isEditing ? (
                        <EntryEditor
                          subjects={subjects}
                          teachers={teachers}
                          cell={cell}
                          isPending={isPending}
                          onSave={(payload) => handleSave(p.id, payload)}
                          onClear={cell ? () => handleClear(cell.id) : null}
                          onCancel={() => setEditorKey(null)}
                        />
                      ) : (
                        <Cell
                          cell={cell}
                          period={p}
                          canEdit={canEdit}
                          onClick={() => {
                            if (canEdit) {
                              setSelectedDay(d);
                              setEditorKey(key);
                            }
                          }}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked day cards */}
      <div className="md:hidden divide-y divide-line-soft">
        <div className="px-4 py-4">
          <p className="eyebrow text-ink-faint mb-2">
            {DAY_LONG[selectedDay]}
            {selectedDay === todayDay && (
              <span className="ml-1.5 text-accent normal-case tracking-normal">· today</span>
            )}
          </p>
          <ul className="space-y-2">
            {grid.periods.map((p) => {
              const key = `${selectedDay}:${p.id}`;
              const cell = grid.entries[key];
              const isEditing = editorKey === key && canEdit;
              return (
                <li
                  key={p.id}
                  className={cn(
                    'rounded-md border bg-surface',
                    p.isBreak ? 'border-warn/30 bg-warn-soft/30' : 'border-line-soft',
                  )}
                >
                  <div className="px-3 py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <PeriodHead period={p} compact />
                      {canEdit && !isEditing && (
                        <button
                          type="button"
                          onClick={() => setEditorKey(key)}
                          className="text-ink-faint hover:text-ink"
                          aria-label={cell ? 'Edit' : 'Add entry'}
                        >
                          {cell ? (
                            <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
                          ) : (
                            <Plus className="w-3.5 h-3.5" strokeWidth={2.25} />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="mt-2">
                      {isEditing ? (
                        <EntryEditor
                          subjects={subjects}
                          teachers={teachers}
                          cell={cell}
                          isPending={isPending}
                          onSave={(payload) => handleSave(p.id, payload)}
                          onClear={cell ? () => handleClear(cell.id) : null}
                          onCancel={() => setEditorKey(null)}
                        />
                      ) : (
                        <CellBody cell={cell} period={p} />
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Cells ─────────────────────────────────────────────────────────────────

function PeriodHead({ period, compact }: { period: PeriodRow; compact?: boolean }) {
  return (
    <div className={cn('min-w-0', compact && 'flex items-baseline gap-2')}>
      <p
        className={cn(
          'font-semibold text-ink leading-tight truncate',
          compact ? 'text-[13px]' : 'text-[12.5px]',
        )}
      >
        {period.label ?? `Period ${period.number}`}
        {period.isBreak && (
          <Coffee
            className="w-3 h-3 inline-block ml-1.5 text-warn"
            strokeWidth={2}
          />
        )}
      </p>
      <p className="text-[10.5px] text-ink-faint tabular tracking-tight mt-0.5">
        {period.startTime} – {period.endTime}
      </p>
    </div>
  );
}

function Cell({
  cell,
  period,
  canEdit,
  onClick,
}: {
  cell: TimetableEntryCell | undefined;
  period: PeriodRow;
  canEdit: boolean;
  onClick: () => void;
}) {
  const empty = !cell;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!canEdit}
      className={cn(
        'group w-full min-h-[64px] rounded-md text-left px-2.5 py-2 transition-colors border',
        empty
          ? canEdit
            ? 'border-dashed border-line bg-surface hover:border-ink-faint hover:bg-surface-3/50'
            : 'border-dashed border-line bg-surface'
          : period.isBreak
            ? 'border-warn/30 bg-warn-soft/40'
            : 'border-line-soft bg-surface hover:border-line-strong',
        !canEdit && 'cursor-default',
      )}
    >
      <CellBody cell={cell} period={period} canEdit={canEdit} />
    </button>
  );
}

function CellBody({
  cell,
  period,
  canEdit,
}: {
  cell: TimetableEntryCell | undefined;
  period: PeriodRow;
  canEdit?: boolean;
}) {
  if (!cell) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 text-[11.5px] text-ink-faint',
          canEdit && 'group-hover:text-ink-soft',
        )}
      >
        {canEdit ? (
          <>
            <Plus className="w-3 h-3" strokeWidth={2} /> Add
          </>
        ) : (
          'Free'
        )}
      </span>
    );
  }

  if (cell.subjectName) {
    return (
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-1 flex-wrap">
          <Chip
            tone={subjectTone({
              order: cell.subjectOrder,
              name: cell.subjectName,
            })}
          >
            {cell.subjectName}
          </Chip>
        </div>
        {cell.teacherName && (
          <p className="text-[10.5px] text-ink-soft truncate">
            <span className="font-semibold tracking-wider">
              {teacherInitials(cell.teacherName)}
            </span>
            <span className="text-ink-faint ml-1">{cell.teacherName}</span>
          </p>
        )}
        {cell.notes && (
          <p className="text-[10.5px] text-ink-muted italic truncate" title={cell.notes}>
            {cell.notes}
          </p>
        )}
      </div>
    );
  }

  // No subject — likely break, assembly, or free-play.
  return (
    <div className="min-w-0 space-y-1">
      <p
        className={cn(
          'text-[11.5px] font-semibold',
          period.isBreak ? 'text-warn' : 'text-ink-soft',
        )}
      >
        {cell.notes ?? (period.isBreak ? 'Break' : 'Free period')}
      </p>
      {cell.teacherName && (
        <p className="text-[10.5px] text-ink-faint truncate">
          {cell.teacherName}
        </p>
      )}
    </div>
  );
}

// ── Inline editor ─────────────────────────────────────────────────────────

function EntryEditor({
  subjects,
  teachers,
  cell,
  isPending,
  onSave,
  onClear,
  onCancel,
}: {
  subjects: SubjectRow[];
  teachers: TeacherOption[];
  cell: TimetableEntryCell | undefined;
  isPending: boolean;
  onSave: (payload: {
    subjectId: string | null;
    teacherId: string | null;
    notes: string;
  }) => void;
  onClear: (() => void) | null;
  onCancel: () => void;
}) {
  const [subjectId, setSubjectId] = useState<string>(cell?.subjectId ?? '');
  const [teacherId, setTeacherId] = useState<string>(cell?.teacherId ?? '');
  const [notes, setNotes] = useState<string>(cell?.notes ?? '');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSave({
      subjectId: subjectId || null,
      teacherId: teacherId || null,
      notes,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md border border-line bg-surface p-2.5 space-y-2 shadow-sm"
    >
      <div>
        <label className="text-[10px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
          Subject
        </label>
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="mt-1 w-full rounded-md border border-line bg-surface px-2 py-1.5 text-[12px] text-ink focus:outline-none focus:border-brand"
        >
          <option value="">— none —</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {s.code ? ` (${s.code})` : ''}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
          Teacher
        </label>
        <select
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          className="mt-1 w-full rounded-md border border-line bg-surface px-2 py-1.5 text-[12px] text-ink focus:outline-none focus:border-brand"
        >
          <option value="">— none —</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="e.g. Morning assembly"
          className="mt-1 w-full rounded-md border border-line bg-surface px-2 py-1.5 text-[12px] text-ink focus:outline-none focus:border-brand resize-y"
        />
      </div>
      <div className="flex items-center justify-between gap-1.5 pt-1">
        <div>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              disabled={isPending}
              className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 text-[11px] font-semibold text-ink-soft hover:bg-danger-soft hover:text-danger hover:border-danger/40 transition-colors disabled:opacity-60"
              title="Remove this cell"
            >
              <Trash2 className="w-3 h-3" strokeWidth={1.75} />
              Clear
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 text-[11px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors disabled:opacity-60"
          >
            <X className="w-3 h-3" strokeWidth={2} />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-md bg-ink px-2 py-1 text-[11px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-60"
          >
            <Check className="w-3 h-3" strokeWidth={2.25} />
            {isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

function messageOf(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Please try again.';
}
