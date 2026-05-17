'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { formatPKR } from '@/lib/format';
import type { FeesSeriesPoint } from '@/lib/queries/dashboard';

export function FeesChart({ data }: { data: FeesSeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="collectedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="var(--color-brand)"  stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--color-brand)"  stopOpacity={0}    />
          </linearGradient>
          <linearGradient id="expectedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="var(--color-ink-faint)" stopOpacity={0.18} />
            <stop offset="100%" stopColor="var(--color-ink-faint)" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--color-line-soft)" vertical={false} />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-ink-muted)', fontSize: 11 }} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--color-ink-muted)', fontSize: 11 }}
          tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(1)}M`}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-line)',
            borderRadius: 6,
            fontSize: 12,
            color: 'var(--color-ink)',
          }}
          formatter={(v: number, n: string) => [formatPKR(v), n === 'collected' ? 'Collected' : 'Expected']}
        />
        <Area type="monotone" dataKey="expected"  stroke="var(--color-ink-faint)" strokeWidth={1.5} fill="url(#expectedFill)"  strokeDasharray="4 4" />
        <Area type="monotone" dataKey="collected" stroke="var(--color-brand)"     strokeWidth={2}   fill="url(#collectedFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
