'use client';

import { useState, FormEvent } from 'react';
import { SITE_CONFIG } from '@/lib/constants';

const steps = [
  {
    step: '01',
    title: 'Visit or Reach Out',
    description:
      'Schedule a campus visit or contact us via WhatsApp/phone to learn more about our programs and see our classrooms.',
  },
  {
    step: '02',
    title: 'Submit Application',
    description:
      'Fill out the inquiry form below or hand in the admission form at school. Provide your child\'s basic details.',
  },
  {
    step: '03',
    title: 'Welcome to the Family',
    description:
      'Complete enrollment and your child is ready to join the Falcons family. We\'ll guide you every step of the way!',
  },
];

const programOptions = [
  { value: '', label: 'Select a program' },
  { value: 'nursery', label: 'Nursery (Age 2.5 – 3.5 years)' },
  { value: 'montessori', label: 'Montessori Level (Age 3 – 6 years)' },
  { value: 'kg', label: 'KG – Kindergarten (Age 4 – 6 years)' },
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

  const ctaHref = SITE_CONFIG.whatsapp || (SITE_CONFIG.phone ? `tel:${SITE_CONFIG.phone}` : '#contact');
  const ctaTarget = SITE_CONFIG.whatsapp ? '_blank' : undefined;
  const ctaRel = SITE_CONFIG.whatsapp ? 'noopener noreferrer' : undefined;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function buildWhatsAppMessage(): string {
    const selectedProgram = programOptions.find((p) => p.value === form.program)?.label || form.program;
    return encodeURIComponent(
      `*Admission Enquiry – Falcons Education System*\n\n` +
        `👤 Parent Name: ${form.parentName}\n` +
        `📞 Phone: ${form.phone}\n` +
        `👶 Child Age: ${form.childAge} years\n` +
        `📚 Program: ${selectedProgram}\n` +
        (form.message ? `💬 Message: ${form.message}` : '')
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);

    const message = buildWhatsAppMessage();

    if (SITE_CONFIG.whatsapp) {
      window.open(`${SITE_CONFIG.whatsapp}?text=${message}`, '_blank', 'noopener,noreferrer');
    } else if (SITE_CONFIG.phone) {
      const mailtoSubject = encodeURIComponent('Admission Enquiry – Falcons Education System');
      const mailtoBody = decodeURIComponent(message).replace(/\*/g, '');
      window.location.href = `mailto:${SITE_CONFIG.email}?subject=${mailtoSubject}&body=${encodeURIComponent(mailtoBody)}`;
    }

    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
      setForm(initialForm);
    }, 600);
  }

  return (
    <section
      id="admissions"
      className="py-16 sm:py-24 bg-falcon-cream"
      aria-labelledby="admissions-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-falcon-sage/20 text-falcon-sageDark rounded-full text-sm font-semibold mb-4">
            <span aria-hidden>🎉</span>
            <span>Admissions Open for 2025</span>
          </div>
          <h2
            id="admissions-heading"
            className="font-display font-bold text-3xl sm:text-4xl text-falcon-sageDark mb-4"
          >
            Apply for Admission
          </h2>
          <p className="text-falcon-earth text-lg max-w-2xl mx-auto">
            Enroll your child in our Montessori, Nursery, or KG program. Limited seats — apply
            early to secure your spot.
          </p>
        </div>

        {/* Process steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map(({ step, title, description }, index) => (
            <div key={step} className="relative">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-falcon-sage text-white font-bold text-xl mb-4 shadow-md">
                  {step}
                </div>
                <h3 className="font-display font-bold text-xl text-falcon-sageDark mb-2">
                  {title}
                </h3>
                <p className="text-falcon-earth">{description}</p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className="hidden md:block absolute top-7 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-0.5 bg-falcon-sage/30"
                  aria-hidden
                />
              )}
            </div>
          ))}
        </div>

        {/* Inquiry Form + Direct Contact side by side */}
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Form */}
          <div className="bg-white rounded-3xl shadow-sm border border-falcon-sand/30 p-6 sm:p-8">
            <h3 className="font-display font-bold text-2xl text-falcon-sageDark mb-6">
              Parent Inquiry Form
            </h3>

            {submitted ? (
              <div className="text-center py-10">
                <span className="text-6xl mb-4 block" aria-hidden>✅</span>
                <p className="font-display font-bold text-xl text-falcon-sageDark mb-2">
                  Inquiry Sent!
                </p>
                <p className="text-falcon-earth mb-6">
                  Thank you! We&apos;ll get back to you shortly via WhatsApp or phone.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-falcon-sage text-white rounded-xl font-semibold hover:bg-falcon-sageDark transition-colors"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="parentName"
                      className="block text-sm font-semibold text-falcon-earth mb-1.5"
                    >
                      Parent / Guardian Name <span className="text-red-500" aria-hidden>*</span>
                    </label>
                    <input
                      type="text"
                      id="parentName"
                      name="parentName"
                      required
                      value={form.parentName}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full px-4 py-3 rounded-xl border border-falcon-sand bg-falcon-cream/50 text-falcon-earth placeholder:text-falcon-earth/40 focus:outline-none focus:ring-2 focus:ring-falcon-sage/40 focus:border-falcon-sage transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-falcon-earth mb-1.5"
                    >
                      Phone / WhatsApp Number <span className="text-red-500" aria-hidden>*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+92 3XX XXXXXXX"
                      className="w-full px-4 py-3 rounded-xl border border-falcon-sand bg-falcon-cream/50 text-falcon-earth placeholder:text-falcon-earth/40 focus:outline-none focus:ring-2 focus:ring-falcon-sage/40 focus:border-falcon-sage transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="childAge"
                      className="block text-sm font-semibold text-falcon-earth mb-1.5"
                    >
                      Child&apos;s Age <span className="text-red-500" aria-hidden>*</span>
                    </label>
                    <input
                      type="text"
                      id="childAge"
                      name="childAge"
                      required
                      value={form.childAge}
                      onChange={handleChange}
                      placeholder="e.g. 3 years 2 months"
                      className="w-full px-4 py-3 rounded-xl border border-falcon-sand bg-falcon-cream/50 text-falcon-earth placeholder:text-falcon-earth/40 focus:outline-none focus:ring-2 focus:ring-falcon-sage/40 focus:border-falcon-sage transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="program"
                      className="block text-sm font-semibold text-falcon-earth mb-1.5"
                    >
                      Preferred Program <span className="text-red-500" aria-hidden>*</span>
                    </label>
                    <select
                      id="program"
                      name="program"
                      required
                      value={form.program}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-falcon-sand bg-falcon-cream/50 text-falcon-earth focus:outline-none focus:ring-2 focus:ring-falcon-sage/40 focus:border-falcon-sage transition-colors"
                    >
                      {programOptions.map(({ value, label }) => (
                        <option key={value} value={value} disabled={value === ''}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-semibold text-falcon-earth mb-1.5"
                    >
                      Message (optional)
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={3}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Any specific questions or information…"
                      className="w-full px-4 py-3 rounded-xl border border-falcon-sand bg-falcon-cream/50 text-falcon-earth placeholder:text-falcon-earth/40 focus:outline-none focus:ring-2 focus:ring-falcon-sage/40 focus:border-falcon-sage transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-4 bg-falcon-sage text-white rounded-xl font-bold text-lg hover:bg-falcon-sageDark transition-all shadow-md disabled:opacity-70 tap-target"
                  >
                    {sending ? 'Sending…' : '📱 Send Inquiry via WhatsApp'}
                  </button>

                  <p className="text-xs text-falcon-earth/50 text-center">
                    Your inquiry will be sent via WhatsApp for fastest response.
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Direct contact */}
          <div className="space-y-6">
            <div className="bg-falcon-sageDark text-white rounded-3xl p-6 sm:p-8">
              <h3 className="font-display font-bold text-xl mb-4">Contact Us Directly</h3>
              <p className="text-white/80 mb-6">
                Prefer to talk? Call us, send a WhatsApp message, or come for a walk-in visit
                during school hours.
              </p>
              <div className="space-y-4">
                {SITE_CONFIG.phone && (
                  <a
                    href={`tel:${SITE_CONFIG.phone}`}
                    className="flex items-center gap-3 text-white hover:text-falcon-sageLight transition-colors tap-target"
                  >
                    <span className="text-2xl" aria-hidden>📞</span>
                    <span className="font-medium">{SITE_CONFIG.phone}</span>
                  </a>
                )}
                <a
                  href={ctaHref}
                  target={ctaTarget}
                  rel={ctaRel}
                  className="flex items-center gap-3 text-white hover:text-falcon-sageLight transition-colors tap-target"
                >
                  <span className="text-2xl" aria-hidden>💬</span>
                  <span className="font-medium">WhatsApp Us</span>
                </a>
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="flex items-center gap-3 text-white hover:text-falcon-sageLight transition-colors tap-target"
                >
                  <span className="text-2xl" aria-hidden>✉️</span>
                  <span className="font-medium">{SITE_CONFIG.email}</span>
                </a>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-falcon-sand/30 p-6 sm:p-8">
              <h3 className="font-display font-bold text-xl text-falcon-sageDark mb-3">
                School Hours
              </h3>
              <ul className="space-y-2 text-falcon-earth">
                <li className="flex justify-between">
                  <span>Monday – Friday</span>
                  <span className="font-semibold">8:00 AM – 2:00 PM</span>
                </li>
                <li className="flex justify-between text-falcon-earth/60">
                  <span>Saturday</span>
                  <span>Closed</span>
                </li>
                <li className="flex justify-between text-falcon-earth/60">
                  <span>Sunday</span>
                  <span>Closed</span>
                </li>
              </ul>
              <p className="text-sm text-falcon-earth/60 mt-4">
                * Timings may vary by program. Contact us for details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
