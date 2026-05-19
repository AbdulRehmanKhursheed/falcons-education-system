'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Trash2, ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/format';
import {
  addDocument,
  removeDocument,
} from '@/app/(app)/admissions/[id]/_actions';
import type { ApplicationDocument } from '@/lib/queries/application-detail';
import { Uploader } from '@/components/ui/Uploader';

type Props = {
  applicationId: string;
  documents: ApplicationDocument[];
};

function formatSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ApplicationDetailDocuments({ applicationId, documents }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [mimeType, setMimeType] = useState('');

  function submit() {
    setErr(null);
    if (!label.trim() || !url.trim()) {
      setErr('Label and URL are required');
      return;
    }
    startTransition(async () => {
      const res = await addDocument(applicationId, {
        label,
        url,
        mimeType: mimeType || undefined,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setLabel('');
      setUrl('');
      setMimeType('');
      setAdding(false);
      router.refresh();
    });
  }

  function handleRemove(documentId: string) {
    if (!window.confirm('Remove this document?')) return;
    startTransition(async () => {
      const res = await removeDocument(applicationId, documentId);
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <ul className="divide-y divide-line-soft">
        {documents.length === 0 && (
          <li className="px-5 py-6 text-[12.5px] text-ink-faint italic">
            No documents uploaded yet.
          </li>
        )}
        {documents.map((d) => (
          <li key={d.id} className="px-5 py-3 flex items-start justify-between gap-3">
            <div className="min-w-0 flex items-start gap-3">
              <FileText className="w-4 h-4 text-ink-faint mt-0.5 shrink-0" strokeWidth={1.75} />
              <div className="min-w-0">
                <a
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[13px] font-semibold text-ink hover:text-brand inline-flex items-center gap-1.5 truncate"
                >
                  {d.label}
                  <ExternalLink className="w-3 h-3 shrink-0" strokeWidth={1.75} />
                </a>
                <p className="text-[11px] text-ink-faint mt-0.5 truncate">
                  {formatDate(d.uploadedAt)}
                  {d.mimeType && ` · ${d.mimeType}`}
                  {d.sizeBytes && ` · ${formatSize(d.sizeBytes)}`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(d.id)}
              disabled={isPending}
              className="text-ink-faint hover:text-danger transition-colors shrink-0 p-1"
              aria-label="Remove"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          </li>
        ))}
      </ul>

      <div className="border-t border-line-soft px-5 py-4">
        {adding ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="eyebrow text-ink-faint block mb-1.5">Label</span>
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Birth certificate"
                  className={inputCls}
                />
              </label>
              <label className="block">
                <span className="eyebrow text-ink-faint block mb-1.5">MIME type</span>
                <input
                  value={mimeType}
                  onChange={(e) => setMimeType(e.target.value)}
                  placeholder="application/pdf"
                  className={inputCls}
                />
              </label>
            </div>
            <label className="block">
              <span className="eyebrow text-ink-faint block mb-1.5">File</span>
              <Uploader
                endpoint="applicationDocument"
                value={url}
                onChange={(next) => setUrl(next)}
                placeholder="https://… (paste a document URL)"
              />
            </label>
            {err && <p className="text-[12px] text-danger">{err}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={submit}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-md bg-ink px-3 py-1.5 text-[12px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-60"
              >
                {isPending ? 'Adding…' : 'Add document'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdding(false);
                  setErr(null);
                }}
                className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5 text-[12px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5 text-[12px] font-semibold text-ink-soft hover:bg-surface-3 hover:text-ink transition-colors"
          >
            <Plus className="w-3 h-3" strokeWidth={2.25} />
            Add document
          </button>
        )}
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink focus:bg-surface transition-colors';
