import { notFound } from 'next/navigation';
import { Sparkles, BookOpen } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { formatDate, formatNumber, formatPercent } from '@/lib/format';
import { requireRole } from '@/lib/auth-helpers';
import {
  assertOwnsStudent,
  getChildAssessments,
  getChildHeader,
  type ChildAssessment,
} from '@/lib/queries/parent';
import { ChildHeader } from '../_components/ChildHeader';

export const metadata = { title: 'Grades' };

const areaTone: Record<string, Parameters<typeof Chip>[0]['tone']> = {
  'Practical Life': 'brand',
  Sensorial: 'info',
  Language: 'accent',
  Math: 'warn',
  Cultural: 'brand',
  Social: 'success',
  Motor: 'info',
};

export default async function ChildGradesPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const session = await requireRole(['PARENT']);
  const { studentId } = await params;
  await assertOwnsStudent(session.user.id, studentId);

  const [child, view] = await Promise.all([
    getChildHeader(studentId),
    getChildAssessments(studentId),
  ]);
  if (!child) notFound();

  return (
    <>
      <ChildHeader child={child} activeTab="grades" />

      {view.style === 'montessori' ? (
        <MontessoriView observations={view.observations} />
      ) : (
        <PrimaryView groups={view.groups} />
      )}
    </>
  );
}

function MontessoriView({
  observations,
}: {
  observations: ChildAssessment[];
}) {
  if (observations.length === 0) {
    return (
      <Card>
        <div className="px-5 py-16 text-center">
          <Sparkles className="w-5 h-5 text-accent mx-auto mb-2" strokeWidth={1.5} />
          <p
            className="font-display text-xl text-ink"
            style={{ fontVariationSettings: '"opsz" 24' }}
          >
            Observations are on the way.
          </p>
          <p className="mt-1 text-[13px] text-ink-muted">
            The classroom teachers log moments as your child explores the
            prepared environment. Check back soon.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {observations.map((o) => (
        <li key={o.id}>
          <Card className="h-full">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                {o.area && (
                  <Chip tone={areaTone[o.area] ?? 'neutral'}>{o.area}</Chip>
                )}
                {o.term && (
                  <span className="text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint">
                    {o.term}
                  </span>
                )}
              </div>
              <p
                className="font-display text-lg text-ink leading-snug"
                style={{ fontVariationSettings: '"opsz" 24' }}
              >
                {o.milestone ?? o.notes ?? 'Observation'}
              </p>
              {o.milestone && o.notes && (
                <p className="text-[13px] text-ink-muted leading-relaxed mt-2 line-clamp-3">
                  {o.notes}
                </p>
              )}
              <footer className="mt-4 pt-3 border-t border-line-soft flex items-baseline justify-between gap-2 text-[11.5px] text-ink-faint">
                <span className="truncate">By {o.assessedByName ?? 'Teacher'}</span>
                <span className="tabular">
                  {formatDate(o.assessedAt, { month: 'short', day: 'numeric' })}
                </span>
              </footer>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}

function PrimaryView({
  groups,
}: {
  groups: Array<{ term: string; rows: ChildAssessment[] }>;
}) {
  if (groups.length === 0) {
    return (
      <Card>
        <div className="px-5 py-16 text-center">
          <BookOpen className="w-5 h-5 text-accent mx-auto mb-2" strokeWidth={1.5} />
          <p
            className="font-display text-xl text-ink"
            style={{ fontVariationSettings: '"opsz" 24' }}
          >
            No grades yet.
          </p>
          <p className="mt-1 text-[13px] text-ink-muted">
            Grades will appear here once teachers post the term&rsquo;s
            assessments.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {groups.map((g) => {
        // Compute weighted average percent for the term header.
        const scored = g.rows.filter((r) => r.score !== null && r.scoreMax !== null && r.scoreMax > 0);
        const totalScore = scored.reduce((s, r) => s + Number(r.score), 0);
        const totalMax = scored.reduce((s, r) => s + Number(r.scoreMax), 0);
        const avg = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : null;

        return (
          <Card key={g.term}>
            <CardHeader
              eyebrow="Term"
              title={g.term}
              meta={`${g.rows.length} subject${g.rows.length === 1 ? '' : 's'}`}
              action={
                avg !== null ? (
                  <span className="inline-flex items-baseline gap-1.5">
                    <span className="eyebrow text-ink-faint">Average</span>
                    <span className="font-mono tabular font-semibold text-ink text-[14px]">
                      {formatPercent(avg, 0)}
                    </span>
                  </span>
                ) : undefined
              }
            />
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="bg-surface-2 border-b border-line-soft">
                  <tr className="text-left">
                    <th className="px-5 py-2.5 eyebrow text-ink-faint">Subject</th>
                    <th className="px-5 py-2.5 eyebrow text-ink-faint text-right">Score</th>
                    <th className="px-5 py-2.5 eyebrow text-ink-faint text-right">Grade</th>
                    <th className="px-5 py-2.5 eyebrow text-ink-faint text-right">Recorded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {g.rows.map((r) => (
                    <tr key={r.id}>
                      <td className="px-5 py-3 text-ink font-semibold">
                        {r.subject ?? r.area ?? '—'}
                        {r.notes && (
                          <p className="text-[11.5px] text-ink-muted font-normal mt-0.5 line-clamp-1">
                            {r.notes}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right tabular text-ink">
                        {r.score !== null && r.scoreMax !== null
                          ? `${formatNumber(r.score)}/${formatNumber(r.scoreMax)}`
                          : '—'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {r.grade ? (
                          <span className="inline-flex items-center justify-center w-9 h-7 rounded-md bg-accent-soft text-accent font-mono font-bold text-[12px]">
                            {r.grade}
                          </span>
                        ) : (
                          <span className="text-ink-faint">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right tabular text-[11.5px] text-ink-faint">
                        {formatDate(r.assessedAt, { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
