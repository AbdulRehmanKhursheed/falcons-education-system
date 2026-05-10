'use client';

import { useState, FormEvent } from 'react';
import {
  CheckCircle2,
  ArrowUpRight,
  Phone,
  MessageCircle,
  Mail,
  Send,
  Loader2,
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/Motion';
import { Eyebrow } from '@/components/ui/Eyebrow';

const steps = [
  {
    step: '01',
    title: 'Visit or reach out',
    description:
      'Schedule a campus visit, or message us on WhatsApp. We walk you through the classrooms, programs, and fee structure — no obligation.',
  },
  {
    step: '02',
    title: 'Submit the inquiry',
    description:
      'Fill the form below, or drop the admission form at school. We confirm receipt within one school day and schedule a brief conversation.',
  },
  {
    step: '03',
    title: 'Welcome to the school',
    description:
      'Complete the enrollment paperwork. We pair your child with a class, share the onboarding plan, and prepare the room for their first day.',
  },
];

const programOptions = [
  { value: '',                   label: 'Select a program' },
  { value: 'nursery',            label: 'Nursery · 2.5 – 3.5 years' },
  { value: 'montessori',         label: 'Montessori Level · 3 – 6 years' },
  { value: 'kg',                 label: 'Kindergarten · 4 – 6 years' },
  { value: 'class-1-2',          label: 'Class 1 & 2 · 5 – 7 years' },
  { value: 'class-3-4',          label: 'Class 3 & 4 · 7 – 9 years' },
  { value: 'class-5-6',          label: 'Class 5 & 6 · 9 – 12 years' },
  { value: 'saturday-coaching',  label: 'Saturday Coaching' },
  { value: 'evening-academy',    label: 'Evening Coaching Academy' },
  { value: 'computer-courses',   label: 'Computer Courses for Kids' },
];

interface FormData {
  parentName: string;
  phone: string;
  childAge: string;
  program: string;
  message: string;
}

const initialForm: FormData = {
  parentName: '',
  phone: '',
  childAge: '',
  program: '',
  message: '',
};

export function Admissions() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function buildWhatsAppMessage(): string {
    const selectedProgram = programOptions.find((p) => p.value === form.program)?.label || form.program;
    return encodeURIComponent(
      `Admission Enquiry — Falcons Education System\n\n` +
        `Parent: ${form.parentName}\n` +
        `Phone: ${form.phone}\n` +
        `Child age: ${form.childAge}\n` +
        `Program: ${selectedProgram}\n` +
        (form.message ? `\nMessage:\n${form.message}` : '')
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);

    const message = buildWhatsAppMessage();

    if (SITE_CONFIG.whatsapp) {
      window.open(`${SITE_CONFIG.whatsapp}?text=${message}`, '_blank', 'noopener,noreferrer');
    } else if (SITE_CONFIG.phone) {
      const mailtoSubject = encodeURIComponent('Admission Enquiry — Falcons Education System');
      const mailtoBody = decodeURIComponent(message);
      window.location.href = `mailto:${SITE_CONFIG.email}?subject=${mailtoSubject}&body=${encodeURIComponent(mailtoBody)}`;
    }

    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
      setForm(initialForm);
    }, 600);
  }

  const fieldClasses =
    'w-full px-4 py-3.5 rounded-md border border-line bg-paper text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink focus:bg-paper-pure transition-colors';

  return (
    <section
      id="admissions"
      className="relative bg-paper-warm/40"
      aria-labelledby="admissions-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-20 sm:py-28">

        {/* Section intro */}
        <FadeIn className="grid lg:grid-cols-12 gap-10 items-end mb-20">
          <div className="lg:col-span-7">
            <Eyebrow number="07">Admissions · 2026</Eyebrow>
            <h2
              id="admissions-heading"
              className="mt-6 font-display text-4xl sm:text-5xl lg:text-[3.75rem] leading-[1.05] text-ink"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
            >
              Three quiet steps to{' '}
              <span className="italic text-brand" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
                begin
              </span>
              .
            </h2>
          </div>
          <p className="lg:col-span-5 text-ink-soft text-[1.05rem] leading-[1.65]">
            No bureaucracy, no entrance tests, no rush. We meet, we walk through the
            rooms, and we decide together whether Falcons is right for your child.
          </p>
        </FadeIn>

        {/* Steps */}
        <Stagger className="grid md:grid-cols-3 gap-px bg-line border border-line mb-20">
          {steps.map(({ step, title, description }) => (
            <StaggerItem key={step} className="bg-paper p-8 lg:p-10 hover:bg-paper-warm transition-colors">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                Step · {step}
              </p>
              <h3 className="mt-5 font-display text-2xl text-ink" style={{ fontVariationSettings: '"opsz" 24' }}>
                {title}
              </h3>
              <p className="mt-3 text-[14.5px] text-ink-soft leading-[1.65]">
                {description}
              </p>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Form + Direct Contact */}
        <FadeIn className="grid lg:grid-cols-12 gap-px bg-line border border-line">

          {/* Form */}
          <div className="lg:col-span-7 bg-paper p-8 sm:p-10 lg:p-12">
            <Eyebrow>Parent inquiry</Eyebrow>
            <h3 className="mt-5 font-display text-3xl text-ink" style={{ fontVariationSettings: '"opsz" 48' }}>
              Send us a brief inquiry
            </h3>
            <p className="mt-3 text-[14.5px] text-ink-soft leading-[1.65] max-w-md mb-8">
              The form opens WhatsApp with a pre-filled message — fastest way to hear back.
            </p>

            {submitted ? (
              <div className="border border-line bg-paper-warm/60 p-8 text-center">
                <CheckCircle2 className="h-8 w-8 mx-auto text-accent" strokeWidth={1.5} />
                <p className="mt-5 font-display text-xl text-ink" style={{ fontVariationSettings: '"opsz" 24' }}>
                  Inquiry sent
                </p>
                <p className="mt-2 text-[14px] text-ink-soft">
                  We&apos;ll respond on WhatsApp shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold text-ink underline decoration-line decoration-1 underline-offset-[6px] hover:text-brand hover:decoration-brand transition-colors"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="parentName" className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-faint mb-2">
                      Parent / Guardian name
                    </label>
                    <input
                      type="text"
                      id="parentName"
                      name="parentName"
                      required
                      value={form.parentName}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className={fieldClasses}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-faint mb-2">
                      Phone · WhatsApp
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+92 3XX XXXXXXX"
                      className={fieldClasses}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="childAge" className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-faint mb-2">
                      Child&apos;s age
                    </label>
                    <input
                      type="text"
                      id="childAge"
                      name="childAge"
                      required
                      value={form.childAge}
                      onChange={handleChange}
                      placeholder="e.g. 3 years 2 months"
                      className={fieldClasses}
                    />
                  </div>
                  <div>
                    <label htmlFor="program" className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-faint mb-2">
                      Preferred program
                    </label>
                    <select
                      id="program"
                      name="program"
                      required
                      value={form.program}
                      onChange={handleChange}
                      className={fieldClasses}
                    >
                      {programOptions.map(({ value, label }) => (
                        <option key={value} value={value} disabled={value === ''}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-faint mb-2">
                    Message <span className="text-ink-faint normal-case font-normal tracking-normal">(optional)</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Anything you&apos;d like us to know"
                    className={`${fieldClasses} resize-none`}
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
                  <button
                    type="submit"
                    disabled={sending}
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-4 text-[14px] font-semibold text-paper hover:bg-brand-dark transition-colors disabled:opacity-70"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                        Sending
                      </>
                    ) : (
                      <>
                        Send via WhatsApp
                        <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                      </>
                    )}
                  </button>
                  <p className="text-[12px] text-ink-faint">
                    Opens WhatsApp with a pre-filled message.
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Direct contact */}
          <aside className="lg:col-span-5 bg-ink text-paper p-8 sm:p-10 lg:p-12">
            <Eyebrow className="text-accent-soft">Or reach us directly</Eyebrow>
            <h3 className="mt-5 font-display text-3xl text-paper" style={{ fontVariationSettings: '"opsz" 48' }}>
              We answer the phone.
            </h3>
            <p className="mt-3 text-[14.5px] text-paper/70 leading-[1.65] mb-8">
              Walk-ins welcome during school hours. No appointment needed for a first visit.
            </p>

            <ul className="space-y-1 mb-8">
              {[
                { href: `tel:${SITE_CONFIG.phone}`,        label: SITE_CONFIG.phone,      meta: 'Call · WhatsApp', Icon: Phone },
                { href: `tel:${SITE_CONFIG.phonePTCL}`,    label: SITE_CONFIG.phonePTCL,  meta: 'PTCL landline',   Icon: Phone },
                { href: SITE_CONFIG.whatsapp || '#',       label: 'WhatsApp message',     meta: 'Direct chat',     Icon: MessageCircle, external: true },
                { href: `mailto:${SITE_CONFIG.email}`,     label: SITE_CONFIG.email,      meta: 'Email',            Icon: Mail },
              ].map(({ href, label, meta, Icon, external }) => (
                <li key={meta}>
                  <a
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="flex items-center gap-4 py-4 border-b border-paper/10 hover:bg-paper/5 transition-colors -mx-2 px-2 group"
                  >
                    <Icon className="h-5 w-5 text-accent-soft" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm tracking-tight text-paper break-all">{label}</p>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-paper/40 mt-0.5">{meta}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-paper/40 group-hover:text-paper group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" strokeWidth={2} />
                  </a>
                </li>
              ))}
            </ul>

            <div className="border-t border-paper/15 pt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/40 mb-3">
                Hours
              </p>
              <dl className="space-y-2 text-[13.5px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-paper/70">School · Mon – Fri</dt>
                  <dd className="font-mono text-paper">08:00 – 14:00</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-paper/70">Coaching · Mon – Fri</dt>
                  <dd className="font-mono text-paper">15:30 – 19:30</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-paper/70">Saturday</dt>
                  <dd className="font-mono text-paper">09:00 – 13:00</dd>
                </div>
                <div className="flex justify-between gap-4 text-paper/40">
                  <dt>Sunday</dt>
                  <dd className="font-mono">Closed</dd>
                </div>
              </dl>
            </div>
          </aside>
        </FadeIn>
      </div>
    </section>
  );
}
