import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

const stages = [
  { id: 'RECEIVED', label: 'Received' },
  { id: 'INTERVIEW', label: 'Interview' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'ENROLLED', label: 'Enrolled' },
] as const;

type Stage = (typeof stages)[number]['id'];

type Props = { current: string };

export function ApplicationDetailTimeline({ current }: Props) {
  const currentIdx = stages.findIndex((s) => s.id === current);
  const isDeclined = current === 'DECLINED' || current === 'WITHDRAWN';

  return (
    <div className="px-5 py-5">
      {isDeclined ? (
        <div className="rounded-md border border-danger/20 bg-danger-soft px-4 py-3">
          <p className="text-[12.5px] font-semibold text-danger uppercase tracking-[0.14em]">
            {current === 'DECLINED' ? 'Declined' : 'Withdrawn'}
          </p>
          <p className="text-[12px] text-ink-soft mt-1">
            This application is no longer active in the pipeline.
          </p>
        </div>
      ) : (
        <ol className="flex items-center gap-0 w-full">
          {stages.map((s, i) => {
            const done = i < currentIdx;
            const isCurrent = i === currentIdx;
            const reached = done || isCurrent;
            return (
              <li
                key={s.id}
                className={cn(
                  'flex-1 flex items-center gap-2.5 relative',
                  i < stages.length - 1 && 'pr-2',
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center shrink-0 border',
                      done && 'bg-success text-paper border-success',
                      isCurrent && 'bg-ink text-paper border-ink',
                      !reached && 'bg-surface border-line text-ink-faint',
                    )}
                  >
                    {done ? (
                      <Check className="w-3 h-3" strokeWidth={3} />
                    ) : (
                      <span className="text-[10px] font-bold tabular">{i + 1}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[11.5px] uppercase tracking-[0.14em] font-semibold whitespace-nowrap',
                      reached ? 'text-ink' : 'text-ink-faint',
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < stages.length - 1 && (
                  <span
                    className={cn(
                      'flex-1 h-px',
                      done ? 'bg-success' : 'bg-line',
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
