import { Clock } from 'lucide-react';
import { relativeTime } from '@/lib/format';
import type { AuditEntry } from '@/lib/queries/student-detail';

type Props = { entries: AuditEntry[] };

const actionLabels: Record<string, string> = {
  'application.create': 'Application created',
  'application.update': 'Application updated',
  'application.stage_change': 'Stage moved',
  'application.schedule_interview': 'Interview scheduled',
  'application.decline': 'Application declined',
  'application.approve': 'Application approved',
  'application.convert_to_student': 'Converted to student',
  'application.add_document': 'Document added',
  'application.remove_document': 'Document removed',
};

export function ApplicationDetailActivity({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="px-5 py-6 text-[12.5px] text-ink-faint italic">
        No activity recorded yet.
      </div>
    );
  }
  return (
    <ul className="divide-y divide-line-soft">
      {entries.map((e) => (
        <li key={e.id} className="px-5 py-3 flex items-start gap-3">
          <Clock className="w-3.5 h-3.5 text-ink-faint mt-0.5 shrink-0" strokeWidth={1.75} />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-ink">
              {actionLabels[e.action] ?? e.action}
            </p>
            <p className="text-[11.5px] text-ink-faint mt-0.5">
              {e.actorName ?? 'System'} · {relativeTime(e.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
