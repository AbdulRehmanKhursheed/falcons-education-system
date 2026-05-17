/**
 * School profile constants.
 *
 * These values are intentionally kept in code (rather than in a database
 * table) because they change very rarely and are referenced by SEO,
 * receipts, and the marketing site. To update, edit this file and
 * redeploy — the Settings → School Profile page surfaces them read-only.
 */

export type SchoolProfile = {
  name: string;
  legalName: string;
  tagline: string;
  address: {
    line1: string;
    locality: string;
    city: string;
    country: string;
  };
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  foundedYear: number;
  licenseNo: string;
  principal: string;
  hours: string;
};

export const schoolProfile: SchoolProfile = {
  name: 'Falcons Education System',
  legalName: 'Falcons Education System (Pvt) Ltd',
  tagline: 'A school and coaching center · Rawalpindi',
  address: {
    line1: 'Kamalabad Road, Sonari Bank',
    locality: 'Dhamial Road',
    city: 'Rawalpindi',
    country: 'Pakistan',
  },
  phone: '+92 311 9911288',
  whatsapp: '+92 311 9911288',
  email: 'hello@falconseducation.pk',
  website: 'https://falconseducation.pk',
  foundedYear: 2018,
  licenseNo: 'PVT-RWP-2018-0421',
  principal: 'Mrs. Sumera Khalid',
  hours: 'Mon – Fri · 8:00 AM – 2:30 PM · Sat coaching 9:00 AM – 1:00 PM',
};

export function formatSchoolAddress(p: SchoolProfile = schoolProfile): string {
  return `${p.address.line1}, ${p.address.locality}, ${p.address.city}, ${p.address.country}`;
}
