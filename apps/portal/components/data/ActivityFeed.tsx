import { ClipboardList, Receipt, CalendarCheck, ChartLine, type LucideIcon } from 'lucide-react';
import { recentActivity } from '@/lib/mock-data';

const iconMap: Record<string, LucideIcon> = {
  admission:  ClipboardList,
  fee:        Receipt,
  attendance: CalendarCheck,
  assessment: ChartLine,
};

export function ActivityFeed() {
  return (
    <ul className="divide-y divide-line-soft">
      {recentActivity.map((event) => {
        const Icon = iconMap[event.kind] ?? ClipboardList;
        return (
          <li key={event.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-surface-2 transition-colors">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-surface-3 text-ink-soft shrink-0 mt-0.5">
              <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] text-ink leading-snug truncate">{event.text}</p>
              <p className="text-[11.5px] text-ink-faint mt-0.5 truncate">{event.meta}</p>
            </div>
            <span className="text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint shrink-0 mt-1">
              {event.time}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
