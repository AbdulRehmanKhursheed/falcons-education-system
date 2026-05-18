'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  SkipForward,
  Loader2,
} from 'lucide-react';
import {
  previewImport,
  commitImport,
  type PreviewResult,
  type ValidRow,
  type SkippedRow,
  type ErrorRow,
} from '@/app/(app)/students/import/_actions';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/cn';

type Stage =
  | { kind: 'idle' }
  | { kind: 'previewing' }
  | { kind: 'preview'; data: SuccessPreview; fileName: string }
  | { kind: 'committing'; data: SuccessPreview; fileName: string }
  | { kind: 'done'; created: number };

type SuccessPreview = Extract<PreviewResult, { ok: true }>;

export function StudentsImportForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [stage, setStage] = useState<Stage>({ kind: 'idle' });
  const [err, setErr] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFile(file: File | null) {
    if (!file) return;
    setErr(null);
    const isCSV =
      file.name.toLowerCase().endsWith('.csv') ||
      file.type === 'text/csv' ||
      file.type === 'application/vnd.ms-excel';
    if (!isCSV) {
      setErr('Please select a .csv file');
      return;
    }
    if (file.size > 1_000_000) {
      setErr('File too large (max 1 MB)');
      return;
    }
    setStage({ kind: 'previewing' });
    const fd = new FormData();
    fd.set('file', file);

    startTransition(async () => {
      const res = await previewImport(fd);
      if (!res.ok) {
        setErr(res.error);
        setStage({ kind: 'idle' });
        return;
      }
      setStage({ kind: 'preview', data: res, fileName: file.name });
    });
  }

  function reset() {
    setErr(null);
    setStage({ kind: 'idle' });
    if (fileRef.current) fileRef.current.value = '';
  }

  function doCommit() {
    if (stage.kind !== 'preview') return;
    setErr(null);
    setStage({ kind: 'committing', data: stage.data, fileName: stage.fileName });
    const valid = stage.data.valid;

    startTransition(async () => {
      const res = await commitImport(valid);
      if (!res.ok) {
        setErr(res.error);
        setStage({ kind: 'preview', data: stage.data, fileName: stage.fileName });
        return;
      }
      setStage({ kind: 'done', created: res.created });
      // Redirect after a beat so the user sees the confirmation
      window.setTimeout(() => {
        router.push(`/students?imported=${res.created}`);
        router.refresh();
      }, 600);
    });
  }

  return (
    <div className="space-y-6">
      {err && (
        <p className="text-[12.5px] text-danger bg-danger-soft px-3.5 py-2.5 rounded-md border border-danger/20">
          {err}
        </p>
      )}

      {(stage.kind === 'idle' || stage.kind === 'previewing') && (
        <UploadStep
          inputRef={fileRef}
          busy={stage.kind === 'previewing' || isPending}
          onFile={handleFile}
        />
      )}

      {stage.kind === 'preview' && (
        <PreviewStep
          data={stage.data}
          fileName={stage.fileName}
          onCommit={doCommit}
          onReset={reset}
          busy={isPending}
        />
      )}

      {stage.kind === 'committing' && (
        <div className="rounded-lg border border-line bg-surface px-5 py-8 text-center">
          <Loader2 className="w-5 h-5 mx-auto text-ink-soft animate-spin" strokeWidth={1.75} />
          <p className="mt-3 text-[13.5px] font-semibold text-ink">Importing {stage.data.valid.length} students…</p>
          <p className="mt-1 text-[12px] text-ink-faint">Please don&apos;t close this tab.</p>
        </div>
      )}

      {stage.kind === 'done' && (
        <div className="rounded-lg border border-success/30 bg-success-soft px-5 py-8 text-center">
          <CheckCircle2 className="w-6 h-6 mx-auto text-success" strokeWidth={1.75} />
          <p className="mt-3 font-display text-xl text-ink" style={{ fontVariationSettings: '"opsz" 24' }}>
            Imported {stage.created} students.
          </p>
          <p className="mt-1 text-[12.5px] text-ink-soft">Redirecting to the roster…</p>
        </div>
      )}
    </div>
  );
}

// ── Step 1 — Upload ────────────────────────────────────────────────────────

function UploadStep({
  inputRef,
  busy,
  onFile,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  busy: boolean;
  onFile: (f: File | null) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0] ?? null;
        onFile(file);
      }}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 sm:py-16 text-center cursor-pointer transition-colors',
        dragOver
          ? 'border-ink bg-surface-2'
          : 'border-line hover:border-ink-faint bg-surface',
        busy && 'opacity-60 cursor-wait'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        disabled={busy}
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      <span className="inline-flex items-center justify-center w-11 h-11 rounded-md bg-surface-2 border border-line text-ink-soft">
        {busy ? (
          <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.75} />
        ) : (
          <Upload className="w-5 h-5" strokeWidth={1.5} />
        )}
      </span>
      <div>
        <p className="font-display text-lg text-ink" style={{ fontVariationSettings: '"opsz" 24' }}>
          {busy ? 'Parsing CSV…' : 'Drop your CSV here'}
        </p>
        <p className="mt-1 text-[12.5px] text-ink-muted">
          or <span className="underline decoration-ink-faint">tap to browse</span>
        </p>
      </div>
      <p className="text-[11px] text-ink-faint mt-1">UTF-8 · max 1 MB · up to 2,000 rows</p>
    </label>
  );
}

// ── Step 2 — Preview ───────────────────────────────────────────────────────

function PreviewStep({
  data,
  fileName,
  onCommit,
  onReset,
  busy,
}: {
  data: SuccessPreview;
  fileName: string;
  onCommit: () => void;
  onReset: () => void;
  busy: boolean;
}) {
  const { valid, skipped, errors } = data;
  const canCommit = valid.length > 0;

  return (
    <div className="space-y-5">
      {/* File summary */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface-2 px-4 py-3">
        <FileText className="w-4 h-4 text-ink-soft" strokeWidth={1.75} />
        <span className="font-mono text-[12.5px] text-ink-soft truncate">{fileName}</span>
        <div className="ml-auto flex gap-1.5">
          <Chip tone="success">
            <CheckCircle2 className="w-3 h-3" strokeWidth={2} /> {valid.length} valid
          </Chip>
          <Chip tone="neutral">
            <SkipForward className="w-3 h-3" strokeWidth={2} /> {skipped.length} skipped
          </Chip>
          <Chip tone="danger">
            <AlertCircle className="w-3 h-3" strokeWidth={2} /> {errors.length} errors
          </Chip>
        </div>
      </div>

      {data.classroomsMissing.length > 0 && (
        <p className="text-[12.5px] text-warn bg-warn-soft px-3.5 py-2.5 rounded-md border border-warn/20">
          Classroom not found: {data.classroomsMissing.map((c) => `"${c}"`).join(', ')}. Create the classroom first, then re-upload — those rows will be imported.
        </p>
      )}

      {/* Sections */}
      {valid.length > 0 && <ValidTable rows={valid} />}
      {errors.length > 0 && <ErrorsTable rows={errors} />}
      {skipped.length > 0 && <SkippedTable rows={skipped} />}

      {/* Commit bar */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line-soft pt-5">
        <button
          type="button"
          disabled={!canCommit || busy}
          onClick={onCommit}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
          )}
          {busy ? 'Working…' : `Import ${valid.length} students`}
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-4 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors disabled:opacity-60"
        >
          Choose a different file
        </button>
      </div>
    </div>
  );
}

// ── Tables ─────────────────────────────────────────────────────────────────

function SectionHeader({
  tone,
  title,
  count,
}: {
  tone: 'success' | 'danger' | 'neutral';
  title: string;
  count: number;
}) {
  const dotCls =
    tone === 'success' ? 'bg-success' : tone === 'danger' ? 'bg-danger' : 'bg-ink-faint';
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className={cn('inline-block w-1.5 h-1.5 rounded-full', dotCls)} aria-hidden />
      <h4 className="eyebrow text-ink-soft">
        {title} <span className="tabular text-ink-faint">· {count}</span>
      </h4>
    </div>
  );
}

function ValidTable({ rows }: { rows: ValidRow[] }) {
  return (
    <div>
      <SectionHeader tone="success" title="Ready to import" count={rows.length} />
      <div className="rounded-md border border-line bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead className="bg-success-soft/40 border-b border-line-soft">
              <tr className="text-left">
                {['#', 'Name', 'DoB', 'Classroom', 'Guardian', 'Phone'].map((h) => (
                  <th key={h} className="px-3 py-2 eyebrow text-ink-faint whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {rows.map((r) => (
                <tr key={r.rowNumber} className="hover:bg-surface-2 transition-colors">
                  <td className="px-3 py-2 font-mono text-[11px] text-ink-faint tabular">{r.rowNumber}</td>
                  <td className="px-3 py-2 text-ink font-semibold whitespace-nowrap">
                    {r.data.firstName} {r.data.lastName}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11.5px] text-ink-soft tabular">{r.data.dateOfBirth}</td>
                  <td className="px-3 py-2 text-ink-soft whitespace-nowrap">{r.data.classroomName}</td>
                  <td className="px-3 py-2 text-ink-soft whitespace-nowrap">{r.data.guardianName}</td>
                  <td className="px-3 py-2 font-mono text-[11.5px] text-ink-soft tabular">{r.data.guardianPhone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SkippedTable({ rows }: { rows: SkippedRow[] }) {
  return (
    <div>
      <SectionHeader tone="neutral" title="Skipped (already in roster or duplicate)" count={rows.length} />
      <div className="rounded-md border border-line bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead className="bg-surface-2 border-b border-line-soft">
              <tr className="text-left">
                {['#', 'Name', 'DoB', 'Reason'].map((h) => (
                  <th key={h} className="px-3 py-2 eyebrow text-ink-faint whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {rows.map((r) => (
                <tr key={r.rowNumber}>
                  <td className="px-3 py-2 font-mono text-[11px] text-ink-faint tabular">{r.rowNumber}</td>
                  <td className="px-3 py-2 text-ink-soft whitespace-nowrap">
                    {r.raw.firstName} {r.raw.lastName}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11.5px] text-ink-soft tabular">{r.raw.dateOfBirth}</td>
                  <td className="px-3 py-2 text-ink-muted">
                    {r.reason}
                    {r.existingRollNo && (
                      <span className="ml-1 font-mono text-[11px] text-ink-faint tabular">({r.existingRollNo})</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ErrorsTable({ rows }: { rows: ErrorRow[] }) {
  return (
    <div>
      <SectionHeader tone="danger" title="Errors (will be skipped)" count={rows.length} />
      <div className="rounded-md border border-danger/20 bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead className="bg-danger-soft/40 border-b border-line-soft">
              <tr className="text-left">
                {['#', 'Name', 'Issues'].map((h) => (
                  <th key={h} className="px-3 py-2 eyebrow text-ink-faint whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {rows.map((r) => (
                <tr key={r.rowNumber}>
                  <td className="px-3 py-2 font-mono text-[11px] text-ink-faint tabular align-top">{r.rowNumber}</td>
                  <td className="px-3 py-2 text-ink-soft whitespace-nowrap align-top">
                    {r.raw.firstName || '—'} {r.raw.lastName || ''}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <ul className="space-y-0.5">
                      {r.errors.map((e, i) => (
                        <li key={i} className="text-danger text-[12px]">
                          {e}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
