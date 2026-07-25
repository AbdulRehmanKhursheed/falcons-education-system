import { Hero } from '@/components/home/Hero';
import { ProgramRows } from '@/components/home/ProgramRows';
import { StatsBand } from '@/components/home/StatsBand';
import { GalleryMarquee } from '@/components/home/GalleryMarquee';
import { Quote } from '@/components/home/Quote';
import { AdmissionsStrip } from '@/components/home/AdmissionsStrip';

export default function Home() {
  return (
    <>
      <Hero />
      <ProgramRows />
      <StatsBand />
      <GalleryMarquee />
      <Quote />
      <AdmissionsStrip />
    </>
  );
}
