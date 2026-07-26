import { CountUp, FadeIn, Stagger, StaggerItem } from '@/components/ui/Motion';

const STATS = [
  { value: 2024, label: 'Founded', plain: true },
  { value: 9, label: 'Levels — Play Group to Class 6' },
  { value: 6, label: 'Coaching days a week' },
  { value: 3, label: 'Programs under one roof' },
];

export function StatsBand() {
  return (
    <section className="bg-navy py-20 md:py-24" aria-label="School at a glance">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <FadeIn>
          <h2 className="max-w-xl text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">
            Small school. <span className="text-sun">Serious about every child.</span>
          </h2>
        </FadeIn>
        <Stagger className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {STATS.map((s) => (
            <StaggerItem key={s.label}>
              <p className="font-display text-5xl font-extrabold text-brand md:text-6xl">
                {s.plain ? s.value : <CountUp value={s.value} />}
              </p>
              <p className="mt-2 text-[0.9375rem] font-semibold leading-snug text-white/60">{s.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
