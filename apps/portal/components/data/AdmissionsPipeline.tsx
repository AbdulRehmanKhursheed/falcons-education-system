'use client';

import { applications, type Application } from '@/lib/mock-data';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { ArrowUpRight, Globe, MessageCircle, MapPin, UsersRound } from 'lucide-react';
import { formatDate } from '@/lib/format';

const stages: Array<{ id: Application['stage']; label: string; tone: Parameters<typeof Chip>[0]['tone'] }> = [
  { id: 'received',  label: 'Received',      tone: 'neutral' },
  { id: 'interview', label: 'Interview',     tone: 'info'    },
  { id: 'approved',  label: 'Approved',      tone: 'brand'   },
  { id: 'enrolled',  label: 'Enrolled',      tone: 'success' },
];

const sourceIcon = {
  website:  Globe,
  whatsapp: MessageCircle,
  'walk-in': MapPin,
  referral: UsersRound,
} as const;

export function AdmissionsPipeline() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stages.map((stage) => {
        const inStage = applications.filter((a) => a.stage === stage.id);
        return (
          <section key={stage.id} className="bg-surface border border-line rounded-lg flex flex-col min-h-[400px]">

            <header className="flex items-center justify-between px-4 py-3.5 border-b border-line-soft">
              <div className="flex items-center gap-2.5">
                <Chip tone={stage.tone}>{stage.label}</Chip>
                <span className="text-[12px] font-semibold text-ink tabular">{inStage.length}</span>
              </div>
              <button
                type="button"
                className="text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-faint hover:text-ink transition-colors"
              >
                View
              </button>
            </header>

            <ul className="flex-1 px-3 py-3 space-y-2">
              {inStage.length === 0 && (
                <li className="text-center py-10 text-[12.5px] text-ink-faint italic">
                  Empty
                </li>
              )}

              {inStage.map((app) => {
                const SourceIcon = sourceIcon[app.source];
                return (
                  <li key={app.id}>
                    <article className="group bg-surface border border-line-soft rounded-md p-3.5 hover:border-line-strong hover:bg-surface-3 transition-all cursor-pointer">
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

                      <footer className="mt-3 pt-3 border-t border-line-soft flex items-center justify-between">
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
        );
      })}
    </div>
  );
}
