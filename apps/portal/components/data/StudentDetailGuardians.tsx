import { Phone, MessageCircle, Mail, Star, ShieldCheck } from 'lucide-react';
import type { StudentGuardianDetail } from '@/lib/queries/student-detail';

function waLink(phone: string): string {
  // Strip non-digits, convert Pakistani local "03..." to "923..."
  let digits = phone.replace(/\D+/g, '');
  if (digits.startsWith('03')) digits = '92' + digits.slice(1);
  if (digits.startsWith('00')) digits = digits.slice(2);
  return `https://wa.me/${digits}`;
}

function maskCnic(cnic: string | null): string | null {
  if (!cnic) return null;
  const digits = cnic.replace(/\D+/g, '');
  if (digits.length < 5) return '****';
  return `**** **** ${digits.slice(-4)}`;
}

type Props = { guardians: StudentGuardianDetail[] };

export function StudentDetailGuardians({ guardians }: Props) {
  if (guardians.length === 0) {
    return (
      <div className="px-5 py-6 text-[12.5px] text-ink-faint italic">
        No guardian linked yet.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line-soft">
      {guardians.map((g) => (
        <li key={g.guardianId} className="px-5 py-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <p className="font-semibold text-ink text-[14px] flex items-center gap-2">
                {g.fullName}
                {g.isPrimary && (
                  <span
                    title="Primary guardian"
                    className="inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.14em] font-semibold text-accent"
                  >
                    <Star className="w-3 h-3 fill-accent" strokeWidth={0} />
                    Primary
                  </span>
                )}
              </p>
              <p className="text-[11.5px] uppercase tracking-[0.14em] font-semibold text-ink-faint mt-0.5">
                {g.relation}
                {g.occupation && (
                  <span className="ml-2 text-ink-muted normal-case tracking-normal font-normal">
                    · {g.occupation}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[12.5px]">
            <a
              href={`tel:${g.phone}`}
              className="inline-flex items-center gap-2 font-mono text-ink-soft hover:text-ink tabular"
            >
              <Phone className="w-3.5 h-3.5 text-ink-faint" strokeWidth={1.75} />
              {g.phone}
            </a>
            {g.whatsapp && (
              <a
                href={waLink(g.whatsapp)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-mono text-success hover:text-ink tabular"
              >
                <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.75} />
                {g.whatsapp}
              </a>
            )}
            {g.email && (
              <a
                href={`mailto:${g.email}`}
                className="inline-flex items-center gap-2 text-ink-soft hover:text-ink truncate"
              >
                <Mail className="w-3.5 h-3.5 text-ink-faint" strokeWidth={1.75} />
                <span className="truncate">{g.email}</span>
              </a>
            )}
            {g.cnic && (
              <span className="inline-flex items-center gap-2 font-mono text-ink-faint tabular">
                <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
                {maskCnic(g.cnic)}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
