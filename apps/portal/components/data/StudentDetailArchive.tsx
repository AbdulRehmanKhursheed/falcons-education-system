'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Archive } from 'lucide-react';
import { archiveStudent } from '@/app/(app)/students/[id]/_actions';

type Props = { studentId: string };

export function StudentDetailArchive({ studentId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function handle() {
    if (
      !window.confirm(
        'Archive this student? They will be marked inactive and removed from active rosters.',
      )
    ) {
      return;
    }
    setErr(null);
    startTransition(async () => {
      const res = await archiveStudent(studentId);
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.push('/students');
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handle}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-danger hover:bg-danger-soft transition-colors disabled:opacity-60"
      >
        <Archive className="w-3.5 h-3.5" strokeWidth={2} />
        {isPending ? 'Archiving…' : 'Archive'}
      </button>
      {err && (
        <span className="text-[11.5px] text-danger ml-2 self-center">{err}</span>
      )}
    </>
  );
}
