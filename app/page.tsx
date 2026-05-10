import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Programs } from '@/components/Programs';
import { Gallery } from '@/components/Gallery';
import { Testimonials } from '@/components/Testimonials';
import { Admissions } from '@/components/Admissions';
import { Contact } from '@/components/Contact';
import { FAQ } from '@/components/FAQ';
import { SocialLinks } from '@/components/SocialLinks';
import { JournalTeaser } from '@/components/JournalTeaser';

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Programs />
      <Gallery />
      <Testimonials />
      <JournalTeaser />
      <Admissions />
      <Contact />
      <SocialLinks />
      <FAQ />
    </>
  );
}
