'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { AttendanceSeriesPoint } from '@/lib/queries/dashboard';

export function AttendanceChart({ data }: { data: AttendanceSeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap={20}>
        <CartesianGrid stroke="var(--color-line-soft)" vertical={false} />
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-ink-muted)', fontSize: 11 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-ink-muted)', fontSize: 11 }} />
        <Tooltip
          cursor={{ fill: 'var(--color-surface-3)' }}
          contentStyle={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-line)',
            borderRadius: 6,
            fontSize: 12,
            color: 'var(--color-ink)',
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: 'var(--color-ink-muted)' }} iconType="square" iconSize={10} />
        <Bar dataKey="present" stackId="a" fill="var(--color-ink)"      name="Present" radius={[0, 0, 0, 0]} />
        <Bar dataKey="late"    stackId="a" fill="var(--color-accent)"   name="Late"    radius={[0, 0, 0, 0]} />
        <Bar dataKey="absent"  stackId="a" fill="var(--color-ink-faint)" name="Absent" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
