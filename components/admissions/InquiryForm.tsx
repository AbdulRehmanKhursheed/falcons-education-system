'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { trackLead } from '@/components/MetaPixel';

const PROGRAMS = [
  'Nursery (2.5 – 3.5)',
  'Montessori Level (3 – 6)',
  'Kindergarten (4 – 6)',
  'Class 1 & 2',
  'Class 3 & 4',
  'Class 5 & 6',
  'Evening Academy',
  'Saturday Coaching',
  'Computer Courses',
];

const FIELD_CLASSES =
  'w-full rounded-xl border-2 border-line bg-white px-4 py-3 font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-faint focus:border-brand';

export function InquiryForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [program, setProgram] = useState(PROGRAMS[0]);
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    const message = encodeURIComponent(
      `Hi, I'd like to enquire about admission.\n\nParent name: ${name}\nPhone: ${phone}\nProgram: ${program}`,
    );
    window.open(`${SITE_CONFIG.whatsapp}?text=${message}`, '_blank', 'noopener,noreferrer');
    trackLead('admissions-inquiry-form');
    setSent(true);
  }

  return (
    <form onSubmit={handleSubmit} id="admissions" className="scroll-mt-28">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-ink">Your name</span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ayesha Khan"
            className={FIELD_CLASSES}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-ink">Phone / WhatsApp</span>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="03xx xxxxxxx"
            className={FIELD_CLASSES}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-bold text-ink">Program</span>
          <select value={program} onChange={(e) => setProgram(e.target.value)} className={FIELD_CLASSES}>
            {PROGRAMS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-7 py-4 text-base font-bold text-white shadow-card transition-all hover:-translate-y-0.5 hover:bg-brand-dark sm:w-auto"
      >
        Send on WhatsApp
        <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
      </button>

      {sent && (
        <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-soft px-4 py-3 text-sm font-bold text-brand-dark">
          <Check size={16} />
          WhatsApp opened — send the message and we&apos;ll reply the same day.
        </p>
      )}
    </form>
  );
}
