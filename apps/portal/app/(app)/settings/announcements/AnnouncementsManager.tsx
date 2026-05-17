'use client';

import { useState, useTransition } from 'react';
import {
  Plus,
  X,
  Star,
  Pencil,
  Trash2,
  Megaphone,
  Pin,
  CalendarClock,
} from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { formatDate } from '@/lib/format';
import type {
  AnnouncementRow,
  ClassroomOption,
} from '@/lib/queries/settings';
import {
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
} from '@/app/(app)/settings/announcements/_actions';

type Audience = 'ALL' | 'STAFF_ONLY' | 'PARENTS_ONLY' | 'CLASSROOM' | 'CUSTOM';

const AUDIENCE_LABEL: Record<Audience, string> = {
  ALL: 'Everyone',
  STAFF_ONLY: 'Staff only',
  PARENTS_ONLY: 'Parents only',
  CLASSROOM: 'Classroom',
  CUSTOM: 'Custom',
};

const AUDIENCE_TONE: Record<Audience, Parameters<typeof Chip>[0]['tone']> = {
  ALL: 'brand',
  STAFF_ONLY: 'info',
  PARENTS_ONLY: 'warn',
  CLASSROOM: 'accent',
  CUSTOM: 'neutral',
};

type FormState = {
  id: string | null;
  title: string;
  body: string;
  audience: Audience;
  classroomId: string;
  publishAt: string;
  expiresAt: string;
  pinned: boolean;
};

const emptyForm: FormState = {
  id: null,
  title: '',
  body: '',
  audience: 'ALL',
  classroomId: '',
  publishAt: '',
  expiresAt: '',
  pinned: false,
};

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  // YYYY-MM-DDTHH:mm in local time
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Props = {
  rows: AnnouncementRow[];
  classrooms: ClassroomOption[];
};

export function AnnouncementsManager({ rows, classrooms }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  }

  function openEdit(row: AnnouncementRow) {
    setForm({
      id: row.id,
      title: row.title,
      body: row.body,
      audience: row.audience as Audience,
      classroomId: row.classroomId ?? '',
      publishAt: toLocalInput(row.publishAt),
      expiresAt: toLocalInput(row.expiresAt),
      pinned: row.pinned,
    });
    setError(null);
    setShowForm(true);
  }

  function close() {
    setShowForm(false);
    setForm(emptyForm);
    setError(null);
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const input = {
      title: form.title.trim(),
      body: form.body.trim(),
      audience: form.audience,
      classroomId: form.audience === 'CLASSROOM' ? form.classroomId || null : null,
      publishAt: form.publishAt ? new Date(form.publishAt) : new Date(),
      expiresAt: form.expiresAt ? new Date(form.expiresAt) : null,
      pinned: form.pinned,
    };

    startTransition(async () => {
      const result = form.id
        ? await updateAnnouncement(form.id, input)
        : await createAnnouncement(input);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      close();
    });
  }

  function handleDelete(row: AnnouncementRow) {
    if (!confirm(`Delete announcement "${row.title}"?`)) return;
    setError(null);
    setBusyId(row.id);
    startTransition(async () => {
      const result = await deleteAnnouncement(row.id);
      if (!result.ok) setError(result.error);
      setBusyId(null);
    });
  }

  return (
    <div className="bg-surface border border-line rounded-lg">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-line-soft">
        <div>
          <p className="eyebrow text-ink-faint">{rows.length} announcement{rows.length === 1 ? '' : 's'}</p>
          <h3
            className="font-display text-lg text-ink leading-tight inline-flex items-center gap-2"
            style={{ fontVariationSettings: '"opsz" 24' }}
          >
            <Megaphone className="w-4 h-4 text-accent" strokeWidth={1.75} />
            Broadcasts
          </h3>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.25} />
          New announcement
        </button>
      </header>

      {error && (
        <div className="px-5 py-3 border-b border-line-soft bg-danger-soft/50 text-[12.5px] text-danger">
          {error}
        </div>
      )}

      <ul className="divide-y divide-line-soft">
        {rows.length === 0 && (
          <li className="px-5 py-12 text-center text-ink-faint italic text-[13px]">
            No announcements yet. Create one to broadcast to staff or parents.
          </li>
        )}
        {rows.map((row) => {
          const busy = busyId === row.id && isPending;
          const expired =
            row.expiresAt && new Date(row.expiresAt).getTime() < Date.now();
          return (
            <li key={row.id} className="px-5 py-4 hover:bg-surface-3/30">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <Chip tone={AUDIENCE_TONE[row.audience as Audience]}>
                      {AUDIENCE_LABEL[row.audience as Audience]}
                      {row.classroomName ? ` · ${row.classroomName}` : ''}
                    </Chip>
                    {row.pinned && (
                      <Chip tone="warn">
                        <Star className="w-3 h-3 inline-block mr-1" strokeWidth={2.25} />
                        Pinned
                      </Chip>
                    )}
                    {expired && <Chip tone="neutral">Expired</Chip>}
                    <span className="text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
                      {formatDate(row.publishAt)}
                    </span>
                  </div>
                  <p
                    className="font-display text-[15.5px] text-ink leading-tight"
                    style={{ fontVariationSettings: '"opsz" 24' }}
                  >
                    {row.title}
                  </p>
                  <p className="mt-1.5 text-[13px] text-ink-soft leading-[1.6] whitespace-pre-wrap line-clamp-3">
                    {row.body}
                  </p>
                  <p className="mt-2 text-[11.5px] text-ink-muted">
                    Posted by {row.postedByName}
                    {row.expiresAt && (
                      <> · expires {formatDate(row.expiresAt)}</>
                    )}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors disabled:opacity-60"
                  >
                    <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(row)}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-soft hover:bg-danger-soft hover:text-danger hover:border-danger/40 transition-colors disabled:opacity-60"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {showForm && (
        <AnnouncementDialog
          form={form}
          setForm={setForm}
          onClose={close}
          onSubmit={submit}
          classrooms={classrooms}
          isPending={isPending}
          error={error}
        />
      )}
    </div>
  );
}

function AnnouncementDialog({
  form,
  setForm,
  onClose,
  onSubmit,
  classrooms,
  isPending,
  error,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  classrooms: ClassroomOption[];
  isPending: boolean;
  error: string | null;
}) {
  const isEdit = Boolean(form.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 backdrop-blur-sm p-4 pt-16 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-surface border border-line rounded-lg shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 px-5 py-4 border-b border-line-soft">
          <div>
            <p className="eyebrow text-ink-faint">{isEdit ? 'Edit announcement' : 'New announcement'}</p>
            <h3
              className="font-display text-lg text-ink leading-tight"
              style={{ fontVariationSettings: '"opsz" 24' }}
            >
              {isEdit ? form.title || 'Untitled' : 'Compose broadcast'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-faint hover:text-ink transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </header>

        <form onSubmit={onSubmit} className="px-5 py-5 space-y-3">
          <label className="text-[12px] font-semibold text-ink-soft flex flex-col gap-1.5">
            Title
            <input
              required
              maxLength={140}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Parent-teacher meeting · Saturday 10 AM"
              className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-brand"
            />
          </label>

          <label className="text-[12px] font-semibold text-ink-soft flex flex-col gap-1.5">
            Body <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-ink-faint">supports markdown</span>
            <textarea
              required
              rows={6}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Dear parents, …"
              className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-brand font-mono"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-[12px] font-semibold text-ink-soft flex flex-col gap-1.5">
              Audience
              <select
                value={form.audience}
                onChange={(e) =>
                  setForm({ ...form, audience: e.target.value as Audience })
                }
                className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-brand"
              >
                {(Object.keys(AUDIENCE_LABEL) as Audience[]).map((a) => (
                  <option key={a} value={a}>
                    {AUDIENCE_LABEL[a]}
                  </option>
                ))}
              </select>
            </label>
            {form.audience === 'CLASSROOM' && (
              <label className="text-[12px] font-semibold text-ink-soft flex flex-col gap-1.5">
                Classroom
                <select
                  required
                  value={form.classroomId}
                  onChange={(e) => setForm({ ...form, classroomId: e.target.value })}
                  className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-brand"
                >
                  <option value="">Select classroom…</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.academicYear})
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-[12px] font-semibold text-ink-soft flex flex-col gap-1.5">
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="w-3.5 h-3.5" strokeWidth={1.75} /> Publish at
              </span>
              <input
                type="datetime-local"
                value={form.publishAt}
                onChange={(e) => setForm({ ...form, publishAt: e.target.value })}
                className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-brand"
              />
              <span className="text-[10.5px] text-ink-faint">Leave blank to publish now</span>
            </label>
            <label className="text-[12px] font-semibold text-ink-soft flex flex-col gap-1.5">
              Expires at <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-ink-faint">optional</span>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-brand"
              />
            </label>
          </div>

          <label className="inline-flex items-center gap-2 text-[12.5px] text-ink-soft cursor-pointer">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
              className="accent-accent"
            />
            <Pin className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
            Pin to the top of the dashboard
          </label>

          {error && (
            <p className="text-[12px] text-danger bg-danger-soft/50 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-line-soft -mx-5 px-5 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12.5px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-60"
            >
              <Megaphone className="w-3.5 h-3.5" strokeWidth={2} />
              {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
