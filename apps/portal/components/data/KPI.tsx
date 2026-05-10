import { ArrowUpRight, ArrowDownRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

type KPIProps = {
  label: string;
  value: string;
  delta?: { value: string; positive: boolean; suffix?: string };
  Icon: LucideIcon;
};

export function KPI({ label, value, delta, Icon }: KPIProps) {
  return (
    <div className="relative bg-surface border border-line rounded-lg p-5 hover:border-line-strong transition-colors group">
      <div className="flex items-start justify-between mb-6">
        <p className="eyebrow text-ink-faint">{label}</p>
        <Icon className="w-4 h-4 text-accent" strokeWidth={1.5} />
      </div>

      <p className="font-display text-[2rem] leading-none text-ink tabular tracking-[-0.025em]" style={{ fontVariationSettings: '"opsz" 48, "SOFT" 50' }}>
        {value}
      </p>

      {delta && (
        <p
          className={cn(
            'mt-3 inline-flex items-center gap-1 text-[11.5px] font-semibold',
            delta.positive ? 'text-success' : 'text-danger'
          )}
        >
          {delta.positive
            ? <ArrowUpRight   className="w-3 h-3" strokeWidth={2} />
            : <ArrowDownRight className="w-3 h-3" strokeWidth={2} />}
          <span className="tabular">{delta.value}</span>
          {delta.suffix && <span className="text-ink-faint font-normal">{delta.suffix}</span>}
        </p>
      )}
    </div>
  );
}
