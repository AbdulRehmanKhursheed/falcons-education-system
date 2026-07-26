import { Hero } from '@/components/home/Hero';
import { ProgramRows } from '@/components/home/ProgramRows';
// import { StatsBand } from '@/components/home/StatsBand'; // re-enable with the section below
import { GalleryMarquee } from '@/components/home/GalleryMarquee';
import { Quote } from '@/components/home/Quote';
import { AdmissionsStrip } from '@/components/home/AdmissionsStrip';
import { ParentLinks } from '@/components/home/ParentLinks';

export default function Home() {
  return (
    <>
      <Hero />
      <ProgramRows />
      {/* <StatsBand /> */}
      <GalleryMarquee />
      <Quote />
      <AdmissionsStrip />
      <ParentLinks />
    </>
  );
}
