'use client';

/**
 * Top-level tab switch between the two assessment views.
 *
 * Owns nothing but tab state. Each child manages its own filters and search
 * via server actions, so this stays trivially serializable.
 */

import { useState } from 'react';
import { Sparkles, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/cn';
import { MontessoriObservationsList } from './MontessoriObservationsList';
import { PrimaryGradesTable } from './PrimaryGradesTable';
import type {
  MontessoriObservationRow,
  PrimaryGradeRow,
} from '@/lib/queries/assessments';

type Classroom = { id: string; name: string };

type Props = {
  initialTab: 'montessori' | 'primary';
  montessori: {
    rows: MontessoriObservationRow[];
    total: number;
    classrooms: Classroom[];
  };
  primary: {
    rows: PrimaryGradeRow[];
    total: number;
    classrooms: Classroom[];
    terms: string[];
    subjects: string[];
  };
};

export function AssessmentsBrowser({ initialTab, montessori, primary }: Props) {
  const [tab, setTab] = useState<'montessori' | 'primary'>(initialTab);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface p-1">
          <TabButton
            active={tab === 'montessori'}
            onClick={() => setTab('montessori')}
            Icon={Sparkles}
            label="Montessori observations"
            count={montessori.total}
          />
          <TabButton
            active={tab === 'primary'}
            onClick={() => setTab('primary')}
            Icon={GraduationCap}
            label="Primary grades"
            count={primary.total}
          />
        </div>
      </div>

      {tab === 'montessori' ? (
        <MontessoriObservationsList
          initialRows={montessori.rows}
          initialTotal={montessori.total}
          classrooms={montessori.classrooms}
        />
      ) : (
        <PrimaryGradesTable
          initialRows={primary.rows}
          initialTotal={primary.total}
          classrooms={primary.classrooms}
          terms={primary.terms}
          subjects={primary.subjects}
        />
      )}
    </>
  );
}

function TabButton({
  active,
  onClick,
  Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  Icon: typeof Sparkles;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-[12.5px] font-semibold transition-colors',
        active
          ? 'bg-ink text-paper'
          : 'text-ink-soft hover:bg-surface-3 hover:text-ink',
      )}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2} />
      {label}
      <span
        className={cn(
          'inline-flex items-center justify-center min-w-[20px] h-[18px] rounded-full px-1.5 text-[10.5px] tabular',
          active ? 'bg-paper/15 text-paper' : 'bg-surface-3 text-ink-muted',
        )}
      >
        {count}
      </span>
    </button>
  );
}
