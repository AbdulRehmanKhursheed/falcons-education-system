import Link from 'next/link';
import { Bell, BookOpen, CalendarDays, Images, Newspaper } from 'lucide-react';
import { FadeIn } from '@/components/ui/Motion';

/**
 * Quiet quick-links row for families already at the school. Keeping their
 * routine tasks out of the primary nav lets the main menu stay focused on
 * parents who are still choosing a school.
 */
const LINKS = [
  { href: '/syllabus#syllabus', label: 'Syllabus', icon: BookOpen },
  { href: '/syllabus#date-sheets', label: 'Exam date sheets', icon: CalendarDays },
  { href: '/coaching', label: 'Coaching updates', icon: Bell },
  { href: '/gallery', label: 'Photo gallery', icon: Images },
  { href: '/blog', label: 'Blogs for parents', icon: Newspaper },
];

export function ParentLinks() {
  return (
    <section className="border-t border-line bg-paper-warm py-12" aria-labelledby="parent-links-heading">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <FadeIn>
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 id="parent-links-heading" className="text-lg font-extrabold text-ink">
                Already part of Falcons?
              </h2>
              <p className="mt-1 text-[0.9375rem] text-ink-muted">
                The things current parents look for, all in one row.
              </p>
            </div>
            <ul className="flex flex-wrap gap-2.5">
              {LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink-soft transition-all hover:-translate-y-0.5 hover:border-brand-tint hover:text-brand-dark"
                  >
                    <l.icon size={15} className="text-brand" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
