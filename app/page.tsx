import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Programs } from '@/components/Programs';
import { Gallery } from '@/components/Gallery';
import { Testimonials } from '@/components/Testimonials';
import { Admissions } from '@/components/Admissions';
import { Contact } from '@/components/Contact';
import { FAQ } from '@/components/FAQ';
import { SocialLinks } from '@/components/SocialLinks';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Programs />
      <Gallery />

      {/* Blog preview */}
      <section className="py-12 bg-falcon-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-2xl text-falcon-sageDark mb-3">
            Parenting Tips & Insights
          </h2>
          <p className="text-falcon-earth mb-6">
            Read our blog for Montessori education tips, parenting advice, and school updates.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-falcon-sage text-white rounded-xl font-bold hover:bg-falcon-sageDark transition-colors shadow-sm tap-target"
          >
            <span aria-hidden>📰</span> Read Our Blog
          </Link>
        </div>
      </section>

      <Testimonials />
      <Admissions />
      <Contact />
      <SocialLinks />
      <FAQ />
    </>
  );
}
