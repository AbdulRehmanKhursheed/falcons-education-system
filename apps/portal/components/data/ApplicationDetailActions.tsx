'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarClock,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Save,
} from 'lucide-react';
import {
  scheduleInterview,
  declineApplication,
  approveApplication,
  convertToStudent,
  updateApplication,
} from '@/app/(app)/admissions/[id]/_actions';
import type { ConversionClassroom } from '@/lib/queries/application-detail';

type Props = {
  applicationId: string;
  stage: string;
  interviewAt: string | null;
  interviewNotes: string | null;
  studentId: string | null;
  classrooms: ConversionClassroom[];
};

type Panel = 'none' | 'interview' | 'decline' | 'convert' | 'notes';

function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ApplicationDetailActions({
  applicationId,
  stage,
  interviewAt,
  interviewNotes,
  studentId,
  classrooms,
}: Props) {
  const router = useRouter();
  const [panel, setPanel] = useState<Panel>('none');
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  // Interview form
  const [iAt, setIAt] = useState(toLocalInput(interviewAt));
  const [iNotes, setINotes] = useState(interviewNotes ?? '');

  // Decline form
  const [reason, setReason] = useState('');

  // Convert form
  const [classroomId, setClassroomId] = useState(classrooms[0]?.id ?? '');
  const [rollNo, setRollNo] = useState('');

  // Notes editor (interview notes only)
  const [notesDraft, setNotesDraft] = useState(interviewNotes ?? '');

  function reset() {
    setPanel('none');
    setErr(null);
  }

  function submitInterview() {
    setErr(null);
    if (!iAt) {
      setErr('Interview date/time is required');
      return;
    }
    startTransition(async () => {
      const res = await scheduleInterview(applicationId, {
        interviewAt: new Date(iAt).toISOString(),
        interviewNotes: iNotes || undefined,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      reset();
      router.refresh();
    });
  }

  function submitDecline() {
    setErr(null);
    if (!reason.trim()) {
      setErr('Reason is required');
      return;
    }
    startTransition(async () => {
      const res = await declineApplication(applicationId, { reason });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      reset();
      router.refresh();
    });
  }

  function submitApprove() {
    setErr(null);
    startTransition(async () => {
      const res = await approveApplication(applicationId);
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.refresh();
    });
  }

  function submitConvert() {
    setErr(null);
    if (!classroomId) {
      setErr('Pick a classroom');
      return;
    }
    startTransition(async () => {
      const res = await convertToStudent(applicationId, {
        classroomId,
        rollNo: rollNo || undefined,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      // Jump to the new student record.
      router.push(`/students/${res.data!.studentId}`);
      router.refresh();
    });
  }

  function submitNotes() {
    setErr(null);
    startTransition(async () => {
      const res = await updateApplication(applicationId, {
        interviewNotes: notesDraft || undefined,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      reset();
      router.refresh();
    });
  }

  const showActionsRow = stage !== 'ENROLLED' && stage !== 'DECLINED';
  const canApprove = stage === 'INTERVIEW' || stage === 'RECEIVED';
  const canConvert = stage === 'APPROVED' && !studentId;

  return (
    <div className="px-5 pb-5">
      {showActionsRow && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPanel((p) => (p === 'interview' ? 'none' : 'interview'))}
            className={btnSecondary}
          >
            <CalendarClock className="w-3.5 h-3.5" strokeWidth={2} />
            Schedule interview
          </button>

          {canApprove && (
            <button
              type="button"
              onClick={submitApprove}
              disabled={isPending}
              className={btnPrimary}
            >
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
              Approve
            </button>
          )}

          {canConvert && (
            <button
              type="button"
              onClick={() => setPanel((p) => (p === 'convert' ? 'none' : 'convert'))}
              className={btnAccent}
            >
              <GraduationCap className="w-3.5 h-3.5" strokeWidth={2} />
              Convert to student
            </button>
          )}

          <button
            type="button"
            onClick={() => setPanel((p) => (p === 'decline' ? 'none' : 'decline'))}
            className={btnDanger}
          >
            <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
            Decline
          </button>
        </div>
      )}

      {/* Panels */}
      {panel === 'interview' && (
        <div className="mt-4 rounded-md border border-line bg-surface-2 p-4 space-y-3">
          <Field label="Interview date & time" required>
            <input
              type="datetime-local"
              value={iAt}
              onChange={(e) => setIAt(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Notes">
            <textarea
              value={iNotes}
              onChange={(e) => setINotes(e.target.value)}
              rows={3}
              placeholder="Who's interviewing, location, prep…"
              className={`${inputCls} resize-y`}
            />
          </Field>
          {err && <p className="text-[12px] text-danger">{err}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={submitInterview} disabled={isPending} className={btnPrimary}>
              <Save className="w-3.5 h-3.5" strokeWidth={2} />
              {isPending ? 'Saving…' : 'Schedule'}
            </button>
            <button type="button" onClick={reset} className={btnSecondary}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {panel === 'decline' && (
        <div className="mt-4 rounded-md border border-danger/20 bg-danger-soft/40 p-4 space-y-3">
          <Field label="Reason for declining" required>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Age below program minimum"
              className={`${inputCls} resize-y`}
            />
          </Field>
          {err && <p className="text-[12px] text-danger">{err}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={submitDecline} disabled={isPending} className={btnDangerSolid}>
              <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
              {isPending ? 'Declining…' : 'Confirm decline'}
            </button>
            <button type="button" onClick={reset} className={btnSecondary}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {panel === 'convert' && (
        <div className="mt-4 rounded-md border border-accent/30 bg-accent-soft/30 p-4 space-y-3">
          <p className="text-[12px] text-ink-soft">
            Creating a student record will link this application and mark it as enrolled.
            A guardian record is reused if one exists with the same phone number; otherwise a new one is created.
          </p>
          <Field label="Classroom" required>
            <select value={classroomId} onChange={(e) => setClassroomId(e.target.value)} className={inputCls}>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Roll number (optional)">
            <input
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              placeholder="Auto-assigned if blank (FES-YYYY-NNN)"
              className={inputCls}
            />
          </Field>
          {err && <p className="text-[12px] text-danger">{err}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={submitConvert} disabled={isPending} className={btnAccentSolid}>
              <GraduationCap className="w-3.5 h-3.5" strokeWidth={2} />
              {isPending ? 'Converting…' : 'Create student'}
            </button>
            <button type="button" onClick={reset} className={btnSecondary}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Always-on interview notes editor */}
      <div className="mt-5 border-t border-line-soft pt-4">
        <Field label="Interview notes">
          <textarea
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            rows={4}
            placeholder="Capture what you learned in the interview…"
            className={`${inputCls} resize-y`}
          />
        </Field>
        <div className="mt-2">
          <button
            type="button"
            onClick={submitNotes}
            disabled={isPending || notesDraft === (interviewNotes ?? '')}
            className={btnSecondary}
          >
            <Save className="w-3.5 h-3.5" strokeWidth={2} />
            {isPending ? 'Saving…' : 'Save notes'}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink transition-colors';

const btnPrimary =
  'inline-flex items-center gap-2 rounded-md bg-ink px-3 py-1.5 text-[12px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-60';

const btnSecondary =
  'inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5 text-[12px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors disabled:opacity-60';

const btnDanger =
  'inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5 text-[12px] font-semibold text-danger hover:bg-danger-soft transition-colors disabled:opacity-60';

const btnDangerSolid =
  'inline-flex items-center gap-2 rounded-md bg-danger px-3 py-1.5 text-[12px] font-semibold text-paper hover:opacity-90 transition-opacity disabled:opacity-60';

const btnAccent =
  'inline-flex items-center gap-2 rounded-md border border-accent/40 bg-accent-soft px-3 py-1.5 text-[12px] font-semibold text-accent hover:bg-accent/10 transition-colors disabled:opacity-60';

const btnAccentSolid =
  'inline-flex items-center gap-2 rounded-md bg-accent px-3 py-1.5 text-[12px] font-semibold text-paper hover:opacity-90 transition-opacity disabled:opacity-60';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-ink-faint block mb-1.5">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}
