'use client';

import { useState, useTransition } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { ArrowUpRight, ArrowRight, Globe, MessageCircle, MapPin, UsersRound, Phone, X } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { ApplicationRow } from '@/lib/queries/admissions';
import { moveStage } from '@/app/(app)/admissions/_actions';
import { useUrlState } from '@/hooks/useUrlState';

const STAGE_IDS = new Set<ApplicationRow['stage']>([
  'received',
  'interview',
  'approved',
  'enrolled',
  'declined',
]);

type ActiveStage = Exclude<ApplicationRow['stage'], 'declined'>;

const stages: Array<{
  id: ActiveStage;
  label: string;
  tone: Parameters<typeof Chip>[0]['tone'];
  next?: ActiveStage;
}> = [
  { id: 'received',  label: 'Received',  tone: 'neutral', next: 'interview' },
  { id: 'interview', label: 'Interview', tone: 'info',    next: 'approved' },
  { id: 'approved',  label: 'Approved',  tone: 'brand',   next: 'enrolled' },
  { id: 'enrolled',  label: 'Enrolled',  tone: 'success' },
];

const sourceIcon = {
  website:   Globe,
  whatsapp:  MessageCircle,
  'walk-in': MapPin,
  referral:  UsersRound,
  phone:     Phone,
} as const;

type Props = {
  initialApplications: ApplicationRow[];
  canMoveStage: boolean;
};

export function AdmissionsPipeline({ initialApplications, canMoveStage }: Props) {
  const { get, set } = useUrlState();
  const rawStage = get('stage');
  const highlightStage =
    rawStage && STAGE_IDS.has(rawStage as ApplicationRow['stage'])
      ? (rawStage as ApplicationRow['stage'])
      : null;

  const [apps, setApps] = useState(initialApplications);
  const [isPending, startTransition] = useTransition();

  function toggleHighlight(stage: ApplicationRow['stage']) {
    set({ stage: highlightStage === stage ? null : stage });
  }

  function handleMove(id: string, next: ApplicationRow['stage']) {
    const previous = apps;
    // Optimistic update
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, stage: next } : a)),
    );
    startTransition(async () => {
      try {
        await moveStage(id, next);
      } catch {
        // revert on failure
        setApps(previous);
      }
    });
  }

  const declined = apps.filter((a) => a.stage === 'declined');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stages.map((stage) => {
        const inStage = apps.filter((a) => a.stage === stage.id);
        const isHighlighted = highlightStage === stage.id;
        const isDimmed = highlightStage !== null && !isHighlighted;
        return (
          <section
            key={stage.id}
            className={cn(
              'bg-surface border rounded-lg flex flex-col min-h-[400px] transition-all',
              isHighlighted
                ? 'border-ink shadow-sm ring-1 ring-ink/10'
                : 'border-line',
              isDimmed && 'opacity-60',
            )}
          >

            <header className="flex items-center justify-between px-4 py-3.5 border-b border-line-soft">
              <div className="flex items-center gap-2.5">
                <Chip tone={stage.tone}>{stage.label}</Chip>
                <span className="text-[12px] font-semibold text-ink tabular">{inStage.length}</span>
              </div>
              <button
                type="button"
                onClick={() => toggleHighlight(stage.id)}
                aria-pressed={isHighlighted}
                className={cn(
                  'text-[11px] uppercase tracking-[0.14em] font-semibold transition-colors',
                  isHighlighted
                    ? 'text-ink'
                    : 'text-ink-faint hover:text-ink',
                )}
              >
                {isHighlighted ? 'Clear' : 'Focus'}
              </button>
            </header>

            <ul className="flex-1 px-3 py-3 space-y-2">
              {inStage.length === 0 && (
                <li className="text-center py-10 text-[12.5px] text-ink-faint italic">
                  Empty
                </li>
              )}

              {inStage.map((app) => {
                const SourceIcon = sourceIcon[app.source] ?? Globe;
                return (
                  <li key={app.id}>
                    <article className="group bg-surface border border-line-soft rounded-md p-3.5 hover:border-line-strong hover:bg-surface-3 transition-all">
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar name={app.applicantName} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-ink text-[13px] truncate">{app.applicantName}</p>
                          <p className="text-[11.5px] text-ink-faint mt-0.5">{app.childAge}</p>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-ink-faint group-hover:text-ink shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" strokeWidth={2} />
                      </div>

                      <div className="text-[11.5px] text-ink-soft">
                        <p className="font-medium text-ink">{app.programInterest}</p>
                        <p className="font-mono text-[10.5px] text-ink-faint tabular mt-1">{app.parentPhone}</p>
                      </div>

                      <footer className="mt-3 pt-3 border-t border-line-soft flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
                          <SourceIcon className="w-3 h-3" strokeWidth={1.75} />
                          {app.source}
                        </span>
                        <span className="text-[10.5px] text-ink-faint tabular">
                          {formatDate(app.submittedDate, { month: 'short', day: 'numeric' })}
                        </span>
                      </footer>

                      {canMoveStage && stage.next && (
                        <div className="mt-3 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleMove(app.id, stage.next!)}
                            disabled={isPending}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-line bg-surface-2 px-2.5 py-1.5 text-[11px] font-semibold text-ink-soft hover:bg-ink hover:text-paper hover:border-ink transition-colors disabled:opacity-60"
                          >
                            Move to {stages.find((s) => s.id === stage.next)?.label}
                            <ArrowRight className="w-3 h-3" strokeWidth={2} />
                          </button>
                          {stage.id !== 'enrolled' && (
                            <button
                              type="button"
                              onClick={() => handleMove(app.id, 'declined')}
                              disabled={isPending}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-line bg-surface-2 text-ink-faint hover:bg-danger-soft hover:text-danger hover:border-danger/30 transition-colors disabled:opacity-60"
                              aria-label="Decline application"
                              title="Decline"
                            >
                              <X className="w-3 h-3" strokeWidth={2} />
                            </button>
                          )}
                        </div>
                      )}
                    </article>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {/* Declined rail */}
      <section
        className={cn(
          'bg-surface-2/60 border rounded-lg flex flex-col min-h-[400px] transition-all',
          highlightStage === 'declined'
            ? 'border-ink shadow-sm ring-1 ring-ink/10'
            : 'border-line-soft',
          highlightStage !== null && highlightStage !== 'declined' && 'opacity-60',
        )}
      >
        <header className="flex items-center justify-between px-4 py-3.5 border-b border-line-soft">
          <div className="flex items-center gap-2.5">
            <Chip tone="neutral">Declined</Chip>
            <span className="text-[12px] font-semibold text-ink-faint tabular">{declined.length}</span>
          </div>
          <button
            type="button"
            onClick={() => toggleHighlight('declined')}
            aria-pressed={highlightStage === 'declined'}
            className={cn(
              'text-[11px] uppercase tracking-[0.14em] font-semibold transition-colors',
              highlightStage === 'declined'
                ? 'text-ink'
                : 'text-ink-faint hover:text-ink',
            )}
          >
            {highlightStage === 'declined' ? 'Clear' : 'Focus'}
          </button>
        </header>

        <ul className="flex-1 px-3 py-3 space-y-2">
          {declined.length === 0 && (
            <li className="text-center py-10 text-[12.5px] text-ink-faint italic">
              None
            </li>
          )}

          {declined.map((app) => {
            const SourceIcon = sourceIcon[app.source] ?? Globe;
            return (
              <li key={app.id}>
                <article className="bg-surface/60 border border-line-soft rounded-md p-3 opacity-80">
                  <div className="flex items-start gap-3 mb-2">
                    <Avatar name={app.applicantName} size="sm" className="opacity-60" />
                    <div className="flex-1 min-w-0">
                      <p className={cn('font-semibold text-ink-muted text-[13px] truncate line-through decoration-ink-faint/60')}>
                        {app.applicantName}
                      </p>
                      <p className="text-[11.5px] text-ink-faint mt-0.5">{app.childAge}</p>
                    </div>
                  </div>

                  <div className="text-[11.5px] text-ink-faint">
                    <p>{app.programInterest}</p>
                    <p className="font-mono text-[10.5px] tabular mt-1">{app.parentPhone}</p>
                  </div>

                  <footer className="mt-2.5 pt-2.5 border-t border-line-soft flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
                      <SourceIcon className="w-3 h-3" strokeWidth={1.75} />
                      {app.source}
                    </span>
                    <span className="text-[10.5px] text-ink-faint tabular">
                      {formatDate(app.submittedDate, { month: 'short', day: 'numeric' })}
                    </span>
                  </footer>
                </article>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
