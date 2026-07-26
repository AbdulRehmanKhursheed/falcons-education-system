import type { Metadata } from 'next';
import Link from 'next/link';
import { MessageCircle, ArrowRight, Paperclip } from 'lucide-react';
import Image from 'next/image';
import { SITE_CONFIG } from '@/lib/constants';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/Motion';
import { Photo } from '@/components/ui/Photo';
import { InquiryForm } from '@/components/admissions/InquiryForm';

export const metadata: Metadata = {
  title: 'Admissions Open 2026 — School Play Group to Class 6 | Falcons Education System Rawalpindi',
  description:
    'Apply for admission at Falcons Education System Rawalpindi. School from Play Group to Class 6, plus Evening Coaching Academy up to Matric. Limited seats for 2026. Apply today!',
  alternates: { canonical: `${SITE_CONFIG.url}/admissions` },
  openGraph: {
    title: 'Admissions Open 2026 — Falcons Education System Rawalpindi',
    description:
      'Enroll your child in school from Play Group to Class 6, plus evening coaching up to Matric at Falcons Education System, Rawalpindi. Limited seats!',
    url: `${SITE_CONFIG.url}/admissions`,
  },
};

const VISIT_DAY = [
  {
    marker: 'Step one',
    title: 'You send one message',
    body: 'Send us your child’s name and class on WhatsApp. We reply the same day and tell you exactly what to bring.',
  },
  {
    marker: 'Visit day',
    title: 'You walk in, we walk you through',
    body: 'Come any working morning. See the classrooms, meet the teachers, and ask us anything you want.',
  },
  {
    marker: 'The test',
    title: 'A short entry test — placement, not pressure',
    body: 'A short, easy test for your child’s age, in a quiet room. It is not to pass or fail anyone — it helps us pick the right class and see where your child needs help.',
  },
  {
    marker: 'The interview',
    title: 'We meet your child, properly',
    body: 'A teacher sits with your child alone for a few minutes — to see how confident they are, what they enjoy, and how they settle in.',
  },
  {
    marker: 'Same day',
    title: 'Seat confirmed — and a little welcome',
    body: 'After the test, you fill a short form and hand in the documents — and the seat is confirmed. Every new student also gets a small welcome gift with candies from us.',
  },
];

const DOCUMENTS = [
  'Child’s B-Form (birth registration)',
  'Parent/guardian CNIC copy',
  '4 passport-size photographs',
  'Previous school report card (Class 1 onwards)',
];

const PROGRAM_LIST = [
  { name: 'Play Group · Nursery · KG', age: '3 – 6 yrs' },
  { name: 'Class 1 & 2', age: '6 – 7 yrs' },
  { name: 'Class 3 & 4', age: '7 – 9 yrs' },
  { name: 'Class 5 & 6', age: '9 – 12 yrs' },
  { name: 'Evening Coaching Academy', age: 'Play Group – Matric' },
  { name: 'Spoken English', age: 'Anyone' },
  { name: 'Computer Courses', age: 'Anyone' },
];

export default function AdmissionsPage() {
  const waHref = `${SITE_CONFIG.whatsapp}?text=Hi%2C+I%27d+like+to+enquire+about+admissions+at+Falcons+Education+System.`;

  return (
    <>
      {/* Hero: copy left, admission-slip card right */}
      <section className="overflow-hidden bg-paper pb-16 pt-14 md:pt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-5 md:gap-8 md:px-8">
          <div className="md:col-span-3">
            <FadeIn>
              <p className="inline-flex items-center gap-2 rounded-full bg-sun-soft px-4 py-1.5 text-sm font-extrabold text-ink">
                <span className="inline-block h-2 w-2 rounded-full bg-flame" />
                Session 2026 · seats filling by class
              </p>
            </FadeIn>
            <FadeIn delay={0.08}>
              <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] text-ink sm:text-6xl md:text-7xl">
                Your child&apos;s seat <span className="text-brand">is waiting</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted md:text-xl">
                Classes fill up quickly. Send us one WhatsApp message today, visit us this
                week, and your child&apos;s seat is booked.
              </p>
            </FadeIn>
            <FadeIn delay={0.24}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-base font-bold text-white shadow-card transition-all hover:-translate-y-0.5 hover:brightness-105 hover:shadow-float"
                >
                  <MessageCircle size={18} />
                  Message us on WhatsApp — it takes 30 seconds
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                </a>
                <p className="text-sm font-semibold text-ink-faint">
                  0311-9911288 · reply the same day
                </p>
              </div>
            </FadeIn>
          </div>

          {/* Signature: the admission slip */}
          <FadeIn delay={0.2} className="md:col-span-2">
            <div className="relative mx-auto max-w-sm rotate-[-1.5deg] rounded-lg border-2 border-dashed border-ink-faint/40 bg-white p-6 shadow-float transition-transform duration-300 hover:rotate-0">
              <div className="flex items-center gap-3 border-b border-line pb-4">
                <Image src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
                <div>
                  <p className="font-display text-sm font-extrabold leading-tight text-ink">
                    Falcons Education System
                  </p>
                  <p className="text-[0.6875rem] font-bold uppercase tracking-widest text-ink-faint">
                    Admission Slip · Session 2026
                  </p>
                </div>
              </div>
              <dl className="mt-4 space-y-3.5 text-sm">
                <div className="flex items-baseline gap-2">
                  <dt className="shrink-0 font-bold text-ink-muted">Student:</dt>
                  <dd className="flex-1 border-b border-dotted border-ink-faint/60 font-display text-brand-dark">
                    &nbsp;your child&apos;s name
                  </dd>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className="shrink-0 font-bold text-ink-muted">Class:</dt>
                  <dd className="flex-1 border-b border-dotted border-ink-faint/60">
                    &nbsp;Play Group … Class 6
                  </dd>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className="shrink-0 font-bold text-ink-muted">Entry test:</dt>
                  <dd className="flex-1 border-b border-dotted border-ink-faint/60">
                    &nbsp;on your visit · short &amp; friendly
                  </dd>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className="shrink-0 font-bold text-ink-muted">Contact:</dt>
                  <dd className="flex-1 border-b border-dotted border-ink-faint/60 font-semibold">
                    &nbsp;{SITE_CONFIG.phone}
                  </dd>
                </div>
              </dl>
              <span className="absolute -right-3 top-16 rotate-12 rounded border-2 border-flame px-2.5 py-1 text-[0.6875rem] font-extrabold uppercase tracking-widest text-flame">
                Seats filling
              </span>
              <p className="mt-5 text-center text-[0.6875rem] font-semibold text-ink-faint">
                Street 14, Sonari Bank, Kamalabad Road, Rawalpindi
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* The day, told as a story */}
      <section className="bg-paper-warm py-16 md:py-24" aria-labelledby="visit-day-heading">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <h2 id="visit-day-heading" className="max-w-2xl text-3xl font-extrabold text-ink md:text-4xl">
              What actually happens — <span className="text-brand">start to seat</span>
            </h2>
          </FadeIn>
          <div className="mt-12 max-w-3xl">
            <Stagger className="flex flex-col">
              {VISIT_DAY.map((step, i) => (
                <StaggerItem key={step.title} className="relative flex gap-6 pb-10 last:pb-0">
                  {i < VISIT_DAY.length - 1 && (
                    <span className="absolute bottom-0 left-[4.4rem] top-8 w-px bg-brand-tint" aria-hidden="true" />
                  )}
                  <span className="w-[8.8rem] shrink-0 pt-0.5 text-right text-sm font-extrabold uppercase tracking-wide text-brand">
                    {step.marker}
                  </span>
                  <div>
                    <h3 className="text-xl font-extrabold text-ink">{step.title}</h3>
                    <p className="mt-2 leading-relaxed text-ink-muted">{step.body}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* The welcome gift — small, real, ours */}
      <section className="bg-paper py-14 md:py-20" aria-labelledby="gift-heading">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-2 md:gap-14 md:px-8">
          <FadeIn>
            {/* Real photo of the gift pack goes here — add src="/images/welcome-gift.jpg" once photographed */}
            <Photo
              alt="Welcome gift pack for newly admitted students — candies and small surprises"
              label="Gift pack photo — coming soon"
              tone="sun"
              sizes="(min-width: 768px) 50vw, 100vw"
              className="aspect-[4/3] w-full rounded-3xl shadow-card"
            />
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-sm font-extrabold uppercase tracking-wide text-flame">
              A Falcons tradition
            </p>
            <h2 id="gift-heading" className="mt-2 text-3xl font-extrabold text-ink md:text-4xl">
              A sweet start to <span className="text-brand">day one</span> 🎁
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-ink-muted">
              As soon as admission is complete, every new student gets a small welcome gift
              with candies, and a photo with our New Admission frame. It is a small thing,
              but it makes the first day happy — and that is how a child starts to love
              school.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Form + sidebar */}
      <section className="bg-paper py-16 md:py-24" aria-label="Inquiry form">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-5 md:gap-16 md:px-8">
          <FadeIn className="md:col-span-3">
            <h2 className="text-3xl font-extrabold text-ink md:text-4xl">
              Send the first message <span className="text-brand">today</span>
            </h2>
            <p className="mt-3 max-w-md text-ink-muted">
              Fill this in and WhatsApp will open with your details ready to send. Nothing is
              saved on the website.
            </p>
            <div className="mt-8">
              <InquiryForm />
            </div>
          </FadeIn>

          <div className="md:col-span-2">
            <FadeIn>
              <div className="rounded-lg border-2 border-dashed border-ink-faint/40 bg-white p-7">
                <h3 className="flex items-center gap-2 text-lg font-extrabold text-ink">
                  <Paperclip size={19} className="text-brand" />
                  Bring these with you
                </h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {DOCUMENTS.map((d) => (
                    <li key={d} className="flex items-start gap-2.5 text-[0.9375rem] text-ink-soft">
                      <span className="mt-1 font-display text-brand">☐</span>
                      {d}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-sm text-ink-faint">
                  The complete fee structure is shared in writing — on WhatsApp or at the
                  school, before admission.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="mt-6 rounded-lg border border-line bg-white p-7 shadow-paper">
                <h3 className="text-lg font-extrabold text-ink">Open for admission</h3>
                <ul className="mt-4 grid grid-cols-1 gap-2">
                  {PROGRAM_LIST.map((p) => (
                    <li key={p.name} className="flex items-center justify-between text-[0.9375rem]">
                      <span className="font-semibold text-ink-soft">{p.name}</span>
                      <span className="text-ink-faint">{p.age}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/programs"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:text-brand-dark"
                >
                  Program details
                  <ArrowRight size={15} />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-paper pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <FadeIn>
            <div className="rounded-3xl bg-navy px-7 py-12 text-center md:px-16 md:py-14">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Still have <span className="text-sun">questions?</span>
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-white/65">
                Call {SITE_CONFIG.phone} or {SITE_CONFIG.phonePTCL}, or simply walk in any working
                morning. We are happy to show you around.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:brightness-105"
                >
                  Chat on WhatsApp
                </a>
                <a
                  href={`tel:${SITE_CONFIG.phone.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white/25 px-7 py-3.5 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:border-white/50"
                >
                  Call the school
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
