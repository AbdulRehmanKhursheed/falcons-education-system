'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { FAQ_ITEMS } from '@/lib/faq-data';
import { FadeIn } from '@/components/ui/Motion';

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`faq-answer-${index}`}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-[1.0625rem] font-bold text-ink">{question}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand"
        >
          <Plus size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`faq-answer-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 pr-12 leading-relaxed text-ink-muted">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  return (
    <section className="bg-paper py-14 md:py-20" aria-label="Frequently asked questions">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <FadeIn>
          <div>
            {FAQ_ITEMS.map((faq, i) => (
              <FAQItem key={faq.question} {...faq} index={i} />
            ))}
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="mt-10 text-center text-ink-muted">
            Something else on your mind?{' '}
            <a
              href={`tel:${SITE_CONFIG.phone.replace(/\s/g, '')}`}
              className="font-bold text-brand hover:text-brand-dark"
            >
              Call {SITE_CONFIG.phone}
            </a>{' '}
            — we answer the phone.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
