'use client';

/**
 * Drop-in file uploader.
 *
 * Dual-mode:
 *   - When UPLOADTHING_TOKEN is configured (env var set at build time), this
 *     renders the UploadThing widget for drag-and-drop uploads.
 *   - When it's NOT set, it falls back to a plain URL input — the legacy
 *     behaviour the rest of the portal relied on.
 *
 * The parent component always receives a `{ url: string }` via `onChange`,
 * regardless of which mode is active.
 */

import { useState } from 'react';
import { CheckCircle2, Link2, UploadCloud, X } from 'lucide-react';
import {
  generateUploadButton,
  generateUploadDropzone,
} from '@uploadthing/react';
import { uploadthingEnabled, type UploadEndpoint } from '@/lib/uploadthing';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

const UTUploadButton = generateUploadButton<OurFileRouter>();
const UTUploadDropzone = generateUploadDropzone<OurFileRouter>();

type Props = {
  endpoint: UploadEndpoint;
  value?: string;
  onChange: (url: string) => void;
  /** Use dropzone instead of button. Defaults to dropzone for documents. */
  variant?: 'button' | 'dropzone';
  /** Placeholder text for the URL fallback. */
  placeholder?: string;
};

export function Uploader({
  endpoint,
  value,
  onChange,
  variant,
  placeholder,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const resolvedVariant =
    variant ??
    (endpoint === 'applicationDocument' ? 'dropzone' : 'button');

  // ── Fallback mode ──────────────────────────────────────────────────────
  if (!uploadthingEnabled) {
    return (
      <div className="space-y-2">
        <div className="relative">
          <Link2
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint"
            strokeWidth={2}
            aria-hidden
          />
          <input
            type="url"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? 'https://…'}
            className="w-full rounded-md border border-line bg-surface-2 pl-8 pr-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink focus:bg-surface transition-colors"
          />
        </div>
        <p className="text-[11px] text-ink-faint italic">
          File uploads are disabled in this environment. Paste a publicly accessible
          URL instead. (Set <span className="font-mono text-ink-soft">UPLOADTHING_TOKEN</span>{' '}
          to enable drag-and-drop uploads.)
        </p>
        {value && <Preview url={value} onClear={() => onChange('')} />}
      </div>
    );
  }

  // ── UploadThing widget mode ────────────────────────────────────────────
  function handleClientError(err: Error) {
    setError(err.message || 'Upload failed.');
  }

  const widget =
    resolvedVariant === 'dropzone' ? (
      <UTUploadDropzone
        endpoint={endpoint}
        onUploadBegin={() => setError(null)}
        onClientUploadComplete={(res) => {
          setError(null);
          const url = res?.[0]?.url;
          if (url) onChange(url);
        }}
        onUploadError={handleClientError}
        appearance={{
          container:
            'rounded-md border border-dashed border-line bg-surface-2 px-4 py-6 ut-uploading:bg-surface-3 transition-colors',
          label: 'text-[12.5px] font-semibold text-ink-soft',
          allowedContent: 'text-[11px] text-ink-faint',
          button:
            'ut-ready:bg-ink ut-ready:text-paper ut-uploading:bg-ink/70 rounded-md px-3 py-1.5 text-[12px] font-semibold',
        }}
      />
    ) : (
      <UTUploadButton
        endpoint={endpoint}
        onUploadBegin={() => setError(null)}
        onClientUploadComplete={(res) => {
          setError(null);
          const url = res?.[0]?.url;
          if (url) onChange(url);
        }}
        onUploadError={handleClientError}
        appearance={{
          container: 'inline-flex items-center gap-3',
          button:
            'ut-ready:bg-ink ut-ready:text-paper ut-uploading:bg-ink/70 rounded-md px-3 py-1.5 text-[12px] font-semibold',
          allowedContent: 'text-[11px] text-ink-faint',
        }}
        content={{
          button: ({ ready }) => (
            <span className="inline-flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5" strokeWidth={2} />
              {ready ? 'Upload file' : 'Loading…'}
            </span>
          ),
        }}
      />
    );

  return (
    <div className="space-y-2">
      {widget}
      {error && (
        <p className="text-[12px] text-danger bg-danger-soft px-2.5 py-1.5 rounded-md border border-danger/20">
          {error}
        </p>
      )}
      {value && <Preview url={value} onClear={() => onChange('')} />}
    </div>
  );
}

function Preview({ url, onClear }: { url: string; onClear: () => void }) {
  const isImage = /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url);
  return (
    <div className="flex items-center gap-3 p-2 rounded-md border border-line bg-surface-2">
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="Uploaded preview"
          className="h-10 w-10 object-cover rounded-md border border-line"
        />
      ) : (
        <CheckCircle2 className="w-5 h-5 text-success" strokeWidth={1.75} />
      )}
      <div className="min-w-0 flex-1">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate text-[12px] font-semibold text-ink hover:text-brand"
        >
          {url}
        </a>
        <p className="text-[10.5px] text-ink-faint uppercase tracking-[0.14em]">
          Uploaded
        </p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="p-1 text-ink-faint hover:text-danger transition-colors"
        aria-label="Clear uploaded file"
      >
        <X className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}
