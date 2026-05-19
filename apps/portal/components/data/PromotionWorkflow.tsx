'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Check,
  GraduationCap,
  CircleDashed,
  AlertTriangle,
  Plus,
  Copy,
  Eye,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/cn';
import { formatNumber, formatDate } from '@/lib/format';
import type {
  PromotionYearOption,
  SourceClassroom,
  TargetClassroom,
} from '@/lib/queries/promotion';
import { suggestDefaultMapping } from '@/lib/queries/promotion';
import type { PromotionAction } from '@/lib/schemas/promotion';
import type {
  PromotionPreview,
  PromotionResult,
} from '@/app/(app)/settings/promotion/_actions';
import {
  cloneClassrooms,
  commitPromotion,
  createTargetYear,
  previewPromotion,
} from '@/app/(app)/settings/promotion/_actions';

type Mapping = {
  sourceClassroomId: string;
  action: PromotionAction;
  targetClassroomId: string | null;
};

type LoadFn = (
  yearId: string,
  kind: 'source' | 'target',
) => Promise<SourceClassroom[] | TargetClassroom[]>;

type Props = {
  years: PromotionYearOption[];
  defaultSourceYearId: string | null;
  initialSourceClassrooms: SourceClassroom[];
  initialTargetClassrooms: TargetClassroom[];
  initialTargetYearId: string | null;
  loadClassrooms: LoadFn;
};

export function PromotionWorkflow({
  years: yearsProp,
  defaultSourceYearId,
  initialSourceClassrooms,
  initialTargetClassrooms,
  initialTargetYearId,
  loadClassrooms,
}: Props) {
  const router = useRouter();
  const [years, setYears] = useState(yearsProp);
  const [sourceYearId, setSourceYearId] = useState<string | null>(
    defaultSourceYearId,
  );
  const [targetYearId, setTargetYearId] = useState<string | null>(
    initialTargetYearId,
  );
  const [sourceClassrooms, setSourceClassrooms] = useState<SourceClassroom[]>(
    initialSourceClassrooms,
  );
  const [targetClassrooms, setTargetClassrooms] = useState<TargetClassroom[]>(
    initialTargetClassrooms,
  );
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [showCreateYear, setShowCreateYear] = useState(false);
  const [newYearName, setNewYearName] = useState('');
  const [newYearStart, setNewYearStart] = useState('');
  const [newYearEnd, setNewYearEnd] = useState('');
  const [preview, setPreview] = useState<PromotionPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [result, setResult] = useState<PromotionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  // Whenever source or target year changes, refresh the classrooms + reset mapping
  useEffect(() => {
    if (!sourceYearId) {
      setSourceClassrooms([]);
      return;
    }
    startTransition(async () => {
      const rooms = (await loadClassrooms(sourceYearId, 'source')) as SourceClassroom[];
      setSourceClassrooms(rooms);
    });
    setPreview(null);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceYearId]);

  useEffect(() => {
    if (!targetYearId) {
      setTargetClassrooms([]);
      return;
    }
    startTransition(async () => {
      const rooms = (await loadClassrooms(targetYearId, 'target')) as TargetClassroom[];
      setTargetClassrooms(rooms);
    });
    setPreview(null);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetYearId]);

  // Build default mappings whenever both sides resolve.
  useEffect(() => {
    if (sourceClassrooms.length === 0) {
      setMappings([]);
      return;
    }
    setMappings(
      sourceClassrooms.map((s) => {
        const suggestion = suggestDefaultMapping(s, targetClassrooms);
        return {
          sourceClassroomId: s.id,
          action: suggestion.action,
          targetClassroomId: suggestion.targetClassroomId ?? null,
        };
      }),
    );
    setPreview(null);
  }, [sourceClassrooms, targetClassrooms]);

  const sourceYear = years.find((y) => y.id === sourceYearId) ?? null;
  const targetYear = years.find((y) => y.id === targetYearId) ?? null;

  const targetMissingClassrooms = useMemo(() => {
    if (!targetYearId) return false;
    return targetClassrooms.length === 0;
  }, [targetYearId, targetClassrooms]);

  function updateMapping(idx: number, patch: Partial<Mapping>) {
    setMappings((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)),
    );
    setPreview(null);
  }

  function handleCreateYear(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createTargetYear({
        name: newYearName.trim(),
        startDate: new Date(newYearStart),
        endDate: new Date(newYearEnd),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (res.data) {
        setYears((prev) => [
          {
            id: res.data!.id,
            name: res.data!.name,
            startDate: new Date(newYearStart).toISOString(),
            endDate: new Date(newYearEnd).toISOString(),
            isCurrent: false,
            classroomCount: 0,
          },
          ...prev,
        ]);
        setTargetYearId(res.data.id);
      }
      setShowCreateYear(false);
      setNewYearName('');
      setNewYearStart('');
      setNewYearEnd('');
    });
  }

  function handleCloneClassrooms() {
    if (!sourceYearId || !targetYearId) return;
    setError(null);
    startTransition(async () => {
      const res = await cloneClassrooms({ sourceYearId, targetYearId });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      // Re-fetch target rooms
      const rooms = (await loadClassrooms(targetYearId, 'target')) as TargetClassroom[];
      setTargetClassrooms(rooms);
    });
  }

  function handlePreview() {
    if (!sourceYearId || !targetYearId) return;
    setError(null);
    startTransition(async () => {
      const res = await previewPromotion({
        sourceYearId,
        targetYearId,
        mappings: mappings.map((m) => ({
          sourceClassroomId: m.sourceClassroomId,
          action: m.action,
          targetClassroomId: m.targetClassroomId ?? undefined,
        })),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setPreview(res.data ?? null);
    });
  }

  function handleCommit() {
    if (!sourceYearId || !targetYearId) return;
    setError(null);
    startTransition(async () => {
      const res = await commitPromotion({
        sourceYearId,
        targetYearId,
        mappings: mappings.map((m) => ({
          sourceClassroomId: m.sourceClassroomId,
          action: m.action,
          targetClassroomId: m.targetClassroomId ?? undefined,
        })),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setResult(res.data ?? null);
      setConfirmOpen(false);
      router.refresh();
    });
  }

  // Validation for the "Commit" step
  const allMoveMappingsHaveTarget = mappings.every(
    (m) => m.action !== 'move' || !!m.targetClassroomId,
  );
  const canPreview =
    !!sourceYearId &&
    !!targetYearId &&
    sourceClassrooms.length > 0 &&
    mappings.length > 0 &&
    allMoveMappingsHaveTarget;
  const canCommit = canPreview && preview !== null;

  if (result) {
    return <SuccessPanel result={result} />;
  }

  return (
    <div className="space-y-6">
      {/* Step 1 — Pick source year */}
      <StepCard
        n={1}
        title="Pick the source academic year"
        description="This is the year you're promoting students out of. Default is the current year."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <YearSelect
            label="Source year"
            value={sourceYearId}
            onChange={setSourceYearId}
            years={years}
            excludeId={targetYearId}
          />
          {sourceYear && (
            <div className="rounded-md border border-line bg-surface-2 px-3.5 py-2.5 text-[12px] text-ink-soft tabular">
              <p>
                <span className="text-ink-faint">Runs</span>{' '}
                {formatDate(sourceYear.startDate)} → {formatDate(sourceYear.endDate)}
              </p>
              <p>
                <span className="text-ink-faint">Classrooms</span>{' '}
                <span className="text-ink font-semibold">
                  {formatNumber(sourceYear.classroomCount)}
                </span>
                {sourceYear.isCurrent && (
                  <Chip tone="success" className="ml-2">
                    Current
                  </Chip>
                )}
              </p>
            </div>
          )}
        </div>
      </StepCard>

      {/* Step 2 — Pick or create target year */}
      <StepCard
        n={2}
        title="Pick the target academic year"
        description="Where students are being promoted to. You can create a new year inline if it doesn't exist yet."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <YearSelect
            label="Target year"
            value={targetYearId}
            onChange={setTargetYearId}
            years={years}
            excludeId={sourceYearId}
          />
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setShowCreateYear((s) => !s)}
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.25} />
              {showCreateYear ? 'Hide create form' : 'Create new year'}
            </button>
          </div>
        </div>

        {showCreateYear && (
          <form
            onSubmit={handleCreateYear}
            className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-md border border-line-soft bg-surface-3/40"
          >
            <label className="text-[12px] font-semibold text-ink-soft flex flex-col gap-1.5">
              Name
              <input
                required
                value={newYearName}
                onChange={(e) => setNewYearName(e.target.value)}
                placeholder="2027-28"
                className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-ink"
              />
            </label>
            <label className="text-[12px] font-semibold text-ink-soft flex flex-col gap-1.5">
              Start date
              <input
                type="date"
                required
                value={newYearStart}
                onChange={(e) => setNewYearStart(e.target.value)}
                className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-ink"
              />
            </label>
            <label className="text-[12px] font-semibold text-ink-soft flex flex-col gap-1.5">
              End date
              <input
                type="date"
                required
                value={newYearEnd}
                onChange={(e) => setNewYearEnd(e.target.value)}
                className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-ink"
              />
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-60"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2.25} />
                {isPending ? 'Creating…' : 'Create year'}
              </button>
            </div>
          </form>
        )}

        {targetYearId && targetMissingClassrooms && (
          <div className="mt-4 flex items-start gap-3 p-3.5 rounded-md border border-warn/30 bg-warn-soft/40">
            <AlertTriangle className="w-4 h-4 text-warn mt-0.5 shrink-0" strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-ink">
                Target year has no classrooms yet
              </p>
              <p className="text-[12px] text-ink-soft mt-0.5">
                Clone the names, programs, and homeroom assignments from the source
                year. You can edit them afterwards in Academic Years.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCloneClassrooms}
              disabled={isPending || !sourceYearId}
              className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-60 shrink-0"
            >
              <Copy className="w-3.5 h-3.5" strokeWidth={2.25} />
              {isPending ? 'Cloning…' : 'Clone classrooms'}
            </button>
          </div>
        )}
      </StepCard>

      {/* Step 3 — Map mappings */}
      <StepCard
        n={3}
        title="Map source classrooms to target classrooms"
        description="Defaults follow the Class N → Class N+1 convention. Class 6 graduates out of the school. Adjust as needed."
      >
        {sourceClassrooms.length === 0 ? (
          <p className="text-[13px] text-ink-muted italic">
            Pick a source year to see classrooms to map.
          </p>
        ) : (
          <div className="overflow-hidden rounded-md border border-line">
            <table className="w-full text-[13px]">
              <thead className="bg-surface-3/60">
                <tr className="text-left text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
                  <th className="px-4 py-2.5">Source classroom</th>
                  <th className="px-4 py-2.5">Active students</th>
                  <th className="px-4 py-2.5">Action</th>
                  <th className="px-4 py-2.5">Target / Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {sourceClassrooms.map((src, idx) => {
                  const m = mappings[idx];
                  if (!m) return null;
                  return (
                    <MappingRow
                      key={src.id}
                      source={src}
                      mapping={m}
                      targetClassrooms={targetClassrooms}
                      onChange={(patch) => updateMapping(idx, patch)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </StepCard>

      {/* Step 4 — Preview */}
      <StepCard
        n={4}
        title="Preview"
        description="A dry run that calculates exactly how many students will move, graduate, or stay put. Nothing is written until you commit in Step 5."
      >
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handlePreview}
            disabled={!canPreview || isPending}
            className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink hover:bg-surface-3 transition-colors disabled:opacity-50"
          >
            <Eye className="w-3.5 h-3.5" strokeWidth={2} />
            {isPending ? 'Calculating…' : 'Generate preview'}
          </button>
          {!canPreview && (
            <p className="text-[12px] text-ink-muted italic">
              {!sourceYearId || !targetYearId
                ? 'Pick both academic years to continue.'
                : !allMoveMappingsHaveTarget
                  ? 'Every "move" row needs a target classroom.'
                  : 'Add classrooms to the source year to continue.'}
            </p>
          )}
        </div>

        {preview && (
          <div className="mt-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <PreviewStat
                label="Will move"
                value={preview.totalMoved}
                tone="info"
                Icon={ArrowRight}
              />
              <PreviewStat
                label="Will graduate"
                value={preview.totalGraduated}
                tone="success"
                Icon={GraduationCap}
              />
              <PreviewStat
                label="Will skip"
                value={preview.totalSkipped}
                tone="neutral"
                Icon={CircleDashed}
              />
            </div>

            <ul className="divide-y divide-line-soft rounded-md border border-line bg-surface-2/40">
              {preview.rows.map((r) => (
                <li
                  key={r.sourceClassroomId}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-4 py-2.5 text-[12.5px]"
                >
                  <span className="text-ink-soft">
                    <span className="text-ink font-semibold tabular">
                      {formatNumber(r.studentCount)}
                    </span>{' '}
                    students from{' '}
                    <span className="font-semibold text-ink">
                      {r.sourceClassroomName}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-ink-soft">
                    {r.action === 'move' && (
                      <>
                        <ArrowRight className="w-3.5 h-3.5 text-info" strokeWidth={2} />
                        will move to{' '}
                        <span className="font-semibold text-ink">
                          {r.targetClassroomName ?? '—'}
                        </span>
                      </>
                    )}
                    {r.action === 'graduate' && (
                      <>
                        <GraduationCap className="w-3.5 h-3.5 text-success" strokeWidth={2} />
                        will graduate (status set to{' '}
                        <span className="font-semibold text-ink">GRADUATED</span>)
                      </>
                    )}
                    {r.action === 'skip' && (
                      <>
                        <CircleDashed className="w-3.5 h-3.5 text-ink-faint" strokeWidth={2} />
                        will stay enrolled in{' '}
                        <span className="font-semibold text-ink">
                          {r.sourceClassroomName}
                        </span>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </StepCard>

      {/* Step 5 — Commit */}
      <StepCard
        n={5}
        title="Commit promotion"
        description="Runs the move in a single transaction. The source year is marked archived; the target year becomes the new current year."
      >
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={!canCommit || isPending}
            className="inline-flex items-center gap-2 rounded-md bg-danger px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-danger/85 transition-colors disabled:opacity-50 disabled:hover:bg-danger"
          >
            <ShieldAlert className="w-3.5 h-3.5" strokeWidth={2.25} />
            Run promotion
          </button>
          {!canCommit && (
            <p className="text-[12px] text-ink-muted italic">
              Generate a preview before committing.
            </p>
          )}
        </div>
      </StepCard>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-md border border-danger/30 bg-danger-soft text-[12.5px] text-danger">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" strokeWidth={2} />
          {error}
        </div>
      )}

      {confirmOpen && preview && sourceYear && targetYear && (
        <ConfirmModal
          source={sourceYear.name}
          target={targetYear.name}
          preview={preview}
          confirmText={confirmText}
          setConfirmText={setConfirmText}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleCommit}
          isPending={isPending}
        />
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────

function StepCard({
  n,
  title,
  description,
  children,
}: {
  n: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface border border-line rounded-lg">
      <header className="flex items-start gap-4 px-5 py-4 border-b border-line-soft">
        <div className="shrink-0 h-9 w-9 rounded-full bg-ink text-paper flex items-center justify-center font-semibold tabular text-[14px]">
          {n}
        </div>
        <div className="min-w-0">
          <h3
            className="font-display text-lg text-ink leading-tight"
            style={{ fontVariationSettings: '"opsz" 24' }}
          >
            {title}
          </h3>
          <p className="text-[12.5px] text-ink-soft mt-0.5 max-w-2xl">{description}</p>
        </div>
      </header>
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}

function YearSelect({
  label,
  value,
  onChange,
  years,
  excludeId,
}: {
  label: string;
  value: string | null;
  onChange: (id: string | null) => void;
  years: PromotionYearOption[];
  excludeId?: string | null;
}) {
  return (
    <label className="text-[12px] font-semibold text-ink-soft flex flex-col gap-1.5">
      {label}
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-ink"
      >
        <option value="">— select —</option>
        {years
          .filter((y) => y.id !== excludeId)
          .map((y) => (
            <option key={y.id} value={y.id}>
              {y.name}
              {y.isCurrent ? ' · current' : ''}
            </option>
          ))}
      </select>
    </label>
  );
}

function MappingRow({
  source,
  mapping,
  targetClassrooms,
  onChange,
}: {
  source: SourceClassroom;
  mapping: Mapping;
  targetClassrooms: TargetClassroom[];
  onChange: (patch: Partial<Mapping>) => void;
}) {
  return (
    <tr>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink">{source.name}</span>
          <Chip tone="neutral">{source.programKind.replace('_', ' ').toLowerCase()}</Chip>
        </div>
      </td>
      <td className="px-4 py-2.5 text-ink-soft tabular">
        {formatNumber(source.activeStudentCount)}
      </td>
      <td className="px-4 py-2.5">
        <div className="inline-flex rounded-md border border-line overflow-hidden">
          {(['move', 'graduate', 'skip'] as const).map((act) => (
            <button
              key={act}
              type="button"
              onClick={() =>
                onChange({
                  action: act,
                  ...(act === 'move' ? {} : { targetClassroomId: null }),
                })
              }
              className={cn(
                'px-2.5 py-1.5 text-[11.5px] font-semibold border-r border-line last:border-r-0 transition-colors',
                mapping.action === act
                  ? 'bg-ink text-paper'
                  : 'bg-surface text-ink-soft hover:bg-surface-3 hover:text-ink',
              )}
            >
              {act === 'move' && 'Move'}
              {act === 'graduate' && 'Graduate'}
              {act === 'skip' && 'Skip'}
            </button>
          ))}
        </div>
      </td>
      <td className="px-4 py-2.5">
        {mapping.action === 'move' && (
          <select
            value={mapping.targetClassroomId ?? ''}
            onChange={(e) =>
              onChange({ targetClassroomId: e.target.value || null })
            }
            className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-[12.5px] text-ink focus:outline-none focus:border-ink"
          >
            <option value="">— pick target —</option>
            {targetClassrooms.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}
        {mapping.action === 'graduate' && (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-success font-semibold">
            <GraduationCap className="w-3.5 h-3.5" strokeWidth={2} />
            Students graduate
          </span>
        )}
        {mapping.action === 'skip' && (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-faint italic">
            <CircleDashed className="w-3.5 h-3.5" strokeWidth={2} />
            No change
          </span>
        )}
      </td>
    </tr>
  );
}

function PreviewStat({
  label,
  value,
  tone,
  Icon,
}: {
  label: string;
  value: number;
  tone: 'info' | 'success' | 'neutral';
  Icon: typeof ArrowRight;
}) {
  const cls =
    tone === 'success'
      ? 'border-success/30 bg-success-soft/40 text-success'
      : tone === 'info'
        ? 'border-info/30 bg-info-soft/40 text-info'
        : 'border-line bg-surface-3/40 text-ink-soft';

  return (
    <div className={cn('rounded-md border p-3 flex items-start gap-2.5', cls)}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={2} />
      <div className="min-w-0">
        <p className="eyebrow text-ink-faint">{label}</p>
        <p
          className="font-display text-[1.6rem] leading-none text-ink tabular tracking-[-0.025em] mt-1"
          style={{ fontVariationSettings: '"opsz" 32' }}
        >
          {formatNumber(value)}
        </p>
      </div>
    </div>
  );
}

function ConfirmModal({
  source,
  target,
  preview,
  confirmText,
  setConfirmText,
  onCancel,
  onConfirm,
  isPending,
}: {
  source: string;
  target: string;
  preview: PromotionPreview;
  confirmText: string;
  setConfirmText: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  const requiredPhrase = `PROMOTE ${target}`;
  const matches = confirmText.trim() === requiredPhrase;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm">
      <div className="bg-surface border border-line rounded-lg w-full max-w-lg mx-4 shadow-2xl">
        <header className="px-5 py-4 border-b border-line-soft flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-danger mt-0.5 shrink-0" strokeWidth={2} />
          <div>
            <h3
              className="font-display text-lg text-ink leading-tight"
              style={{ fontVariationSettings: '"opsz" 24' }}
            >
              Run promotion — this is irreversible
            </h3>
            <p className="text-[12.5px] text-ink-soft mt-1">
              {formatNumber(preview.totalMoved)} students will move,{' '}
              {formatNumber(preview.totalGraduated)} will graduate, and{' '}
              {formatNumber(preview.totalSkipped)} will stay. {source} will be archived
              and {target} will become the current year.
            </p>
          </div>
        </header>
        <div className="px-5 py-4 space-y-3">
          <label className="block text-[12px] font-semibold text-ink-soft">
            Type{' '}
            <span className="font-mono text-ink bg-surface-3 px-1.5 py-0.5 rounded">
              {requiredPhrase}
            </span>{' '}
            to confirm
            <input
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px] font-mono text-ink focus:outline-none focus:border-ink"
            />
          </label>
        </div>
        <footer className="px-5 py-4 border-t border-line-soft flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-[12px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!matches || isPending}
            className="inline-flex items-center gap-1.5 rounded-md bg-danger px-3 py-1.5 text-[12px] font-semibold text-paper hover:bg-danger/85 transition-colors disabled:opacity-50"
          >
            <ShieldAlert className="w-3.5 h-3.5" strokeWidth={2.25} />
            {isPending ? 'Running…' : 'Run promotion'}
          </button>
        </footer>
      </div>
    </div>
  );
}

function SuccessPanel({ result }: { result: PromotionResult }) {
  return (
    <div className="bg-surface border border-line rounded-lg p-8 text-center">
      <Sparkles className="w-10 h-10 text-success mx-auto" strokeWidth={1.5} />
      <h3
        className="font-display text-2xl text-ink mt-3"
        style={{ fontVariationSettings: '"opsz" 32' }}
      >
        Promotion complete
      </h3>
      <p className="text-[13px] text-ink-soft mt-1.5">
        {result.sourceYearName} is archived. {result.targetYearName} is now the current
        academic year.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-3 max-w-lg mx-auto">
        <div className="rounded-md border border-line bg-surface-2 p-3">
          <p className="eyebrow text-ink-faint">Moved</p>
          <p className="font-display text-2xl text-ink tabular mt-1">
            {formatNumber(result.moved)}
          </p>
        </div>
        <div className="rounded-md border border-line bg-surface-2 p-3">
          <p className="eyebrow text-ink-faint">Graduated</p>
          <p className="font-display text-2xl text-ink tabular mt-1">
            {formatNumber(result.graduated)}
          </p>
        </div>
        <div className="rounded-md border border-line bg-surface-2 p-3">
          <p className="eyebrow text-ink-faint">Skipped</p>
          <p className="font-display text-2xl text-ink tabular mt-1">
            {formatNumber(result.skipped)}
          </p>
        </div>
      </div>

      <a
        href="/settings"
        className="mt-6 inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-2 px-3.5 py-2 text-[12.5px] font-semibold text-ink hover:bg-surface-3 transition-colors"
      >
        <Check className="w-3.5 h-3.5" strokeWidth={2.25} />
        Back to settings
      </a>
    </div>
  );
}
